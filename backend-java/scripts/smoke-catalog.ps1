param(
    [string]$BaseUrl = 'http://127.0.0.1:3001',
    [string]$CatalogUrl = $BaseUrl
)

$ErrorActionPreference = 'Stop'
$email = 'catalog.smoke.' + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() + '@example.com'
$password = 'senha-smoke-123'
$token = $null
$productId = $null
$sellerId = $null

function Assert-Condition([bool]$Condition, [string]$Message) {
    if (-not $Condition) {
        throw $Message
    }
}

function Get-HttpStatus([string]$Uri, [hashtable]$Headers = @{}) {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $Uri -Headers $Headers -TimeoutSec 15
        return [int]$response.StatusCode
    } catch {
        if ($_.Exception.Response) {
            return [int]$_.Exception.Response.StatusCode
        }
        throw
    }
}

function Invoke-MultipartJson(
    [string]$Method,
    [string]$Uri,
    [hashtable]$Fields,
    [byte[]]$ImageBytes,
    [string]$ImageFileName,
    [string]$ImageContentType,
    [string]$BearerToken
) {
    $client = [System.Net.Http.HttpClient]::new()
    $multipart = [System.Net.Http.MultipartFormDataContent]::new()
    try {
        $client.DefaultRequestHeaders.Authorization =
            [System.Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer', $BearerToken)
        foreach ($entry in $Fields.GetEnumerator()) {
            $multipart.Add([System.Net.Http.StringContent]::new([string]$entry.Value), [string]$entry.Key)
        }
        if ($ImageBytes) {
            $imageContent = [System.Net.Http.ByteArrayContent]::new($ImageBytes)
            $imageContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::new($ImageContentType)
            $multipart.Add($imageContent, 'image', $ImageFileName)
        }

        $request = [System.Net.Http.HttpRequestMessage]::new(
            [System.Net.Http.HttpMethod]::new($Method),
            $Uri
        )
        $request.Content = $multipart
        $response = $client.SendAsync($request).GetAwaiter().GetResult()
        $body = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
        if (-not $response.IsSuccessStatusCode) {
            throw "Multipart request failed with HTTP $([int]$response.StatusCode): $body"
        }
        return $body | ConvertFrom-Json
    } finally {
        $multipart.Dispose()
        $client.Dispose()
    }
}

try {
    $ping = Invoke-RestMethod -Uri "$BaseUrl/api/ping" -TimeoutSec 15
    Assert-Condition ($null -ne $ping) 'Node ping failed.'

    $registration = Invoke-RestMethod -Uri "$BaseUrl/api/register" -Method Post `
        -ContentType 'application/json' `
        -Body (@{ name = 'Catalog Smoke Seller'; email = $email; password = $password; role = 'seller' } | ConvertTo-Json) `
        -TimeoutSec 15
    $sellerId = [int]$registration.id
    Assert-Condition ($sellerId -gt 0) 'Registration did not return an id.'

    $login = Invoke-RestMethod -Uri "$BaseUrl/api/login" -Method Post `
        -ContentType 'application/json' `
        -Body (@{ email = $email; password = $password } | ConvertTo-Json) `
        -TimeoutSec 15
    $token = [string]$login.token
    Assert-Condition (-not [string]::IsNullOrWhiteSpace($token)) 'Login did not return a token.'
    $auth = @{ Authorization = "Bearer $token" }

    $created = Invoke-MultipartJson -Method 'POST' -Uri "$CatalogUrl/api/products" -BearerToken $token -Fields @{
        name = 'Produto Smoke Bloco 3'
        description = 'Criado pelo cutover Next'
        price = '39.90'
        stock = '4'
        category_id = '1'
    } -ImageBytes ([byte[]](0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x01)) `
        -ImageFileName 'smoke.png' -ImageContentType 'image/png'
    $productId = [int]$created.produtoId
    Assert-Condition ($productId -gt 0) 'Product creation did not return an id.'

    $detail = Invoke-RestMethod -Uri "$CatalogUrl/api/products/$productId" -TimeoutSec 15
    Assert-Condition ([int]$detail.seller_id -eq $sellerId) 'Product seller mismatch.'
    Assert-Condition ($detail.name -eq 'Produto Smoke Bloco 3') 'Product detail mismatch.'
    $firstImageUrl = [string]$detail.image_url

    $servedImage = Invoke-WebRequest -UseBasicParsing -Uri ($CatalogUrl + $firstImageUrl) -TimeoutSec 15
    Assert-Condition ([int]$servedImage.StatusCode -eq 200) 'Product image was not served.'
    Assert-Condition ($servedImage.RawContentStream.Length -gt 0) 'Served product image is empty.'

    $profile = Invoke-RestMethod -Uri "$BaseUrl/api/sellers/$sellerId/profile" -TimeoutSec 15
    $nodeProduct = $profile.products | Where-Object { [int]$_.id -eq $productId }
    Assert-Condition ($null -ne $nodeProduct) 'Node seller profile did not read the Java-created product.'

    $orders = Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl/api/orders/my" -Headers $auth -TimeoutSec 15
    Assert-Condition ([int]$orders.StatusCode -eq 200) 'Node did not accept the JWT issued by Java.'

    Invoke-MultipartJson -Method 'PUT' -Uri "$CatalogUrl/api/products/$productId" -BearerToken $token -Fields @{
        name = 'Produto Smoke Atualizado'
        description = 'Atualizado pelo cutover Next'
        price = '44.90'
        stock = '6'
        category_id = '1'
    } -ImageBytes ([byte[]](0xFF, 0xD8, 0xFF, 0x01)) `
        -ImageFileName 'smoke.jpg' -ImageContentType 'image/jpeg' | Out-Null

    $afterUpdate = Invoke-RestMethod -Uri "$CatalogUrl/api/products/$productId" -TimeoutSec 15
    Assert-Condition ($afterUpdate.name -eq 'Produto Smoke Atualizado') 'Product update mismatch.'
    Assert-Condition ([string]$afterUpdate.image_url -ne $firstImageUrl) 'Replacement image URL did not change.'
    $oldImageStatus = Get-HttpStatus ($CatalogUrl + $firstImageUrl)
    Assert-Condition ($oldImageStatus -eq 404) "Old image was not removed (HTTP $oldImageStatus)."

    $deletedProductId = $productId
    Invoke-RestMethod -Uri "$CatalogUrl/api/products/$productId" -Method Delete -Headers $auth -TimeoutSec 15 | Out-Null
    $productId = $null
    $deletedProductStatus = Get-HttpStatus "$CatalogUrl/api/products/$deletedProductId"
    Assert-Condition ($deletedProductStatus -eq 404) "Deleted product is still available (HTTP $deletedProductStatus)."
    $deletedImageStatus = Get-HttpStatus ($CatalogUrl + [string]$afterUpdate.image_url)
    Assert-Condition ($deletedImageStatus -eq 404) "Deleted product image is still available (HTTP $deletedImageStatus)."

    Invoke-RestMethod -Uri "$BaseUrl/api/me" -Method Delete -Headers $auth -TimeoutSec 15 | Out-Null
    $sellerId = $null

    Write-Output 'SMOKE_OK ping=node identity=java catalog=java image=java shared_jwt=ok node_catalog_read=ok cleanup=ok'
} finally {
    if ($token -and $productId) {
        try {
            Invoke-RestMethod -Uri "$CatalogUrl/api/products/$productId" -Method Delete `
                -Headers @{ Authorization = "Bearer $token" } -TimeoutSec 10 | Out-Null
        } catch {
        }
    }
    if ($token -and $sellerId) {
        try {
            Invoke-RestMethod -Uri "$BaseUrl/api/me" -Method Delete `
                -Headers @{ Authorization = "Bearer $token" } -TimeoutSec 10 | Out-Null
        } catch {
        }
    }
}
