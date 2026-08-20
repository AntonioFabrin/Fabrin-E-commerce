# Relatório de conclusão — Bloco 1 (base Java)

Data da revalidação: 20/08/2026 (America/Sao_Paulo)

Status: **concluído após correção e reteste**.

## Checklist sequencial

### B1.01 — Módulo Java isolado

- Projeto localizado em `backend-java`.
- Código, configuração e testes separados do backend Node.
- `target`, `.env` e artefatos locais fora do versionamento.
- Resultado: aprovado.

### B1.02 — Java 21

- `java.version` definido como 21 no POM.
- Maven Wrapper executado com Java 21.0.8 durante a validação.
- Resultado: aprovado.

### B1.03 — Spring Boot e Maven Wrapper

- Spring Boot 3.5.16.
- Maven Wrapper 3.9.11 para builds reproduzíveis.
- Resultado: aprovado.

### B1.04 — Dependências-base

- Spring Web, Bean Validation, Spring Data JPA e Actuator presentes.
- Resultado: aprovado.

### B1.05 — Configuração externa

- Datasource, porta, JWT e CORS configuráveis por variáveis de ambiente.
- `.env.example` disponível sem credenciais reais.
- Resultado: aprovado.

### B1.06 — Endpoints operacionais

- `/actuator/health` retorna `UP`.
- `/actuator/info` retorna `app.name` e `app.migration-stage`.
- Resultado inicial: reprovado, pois `/actuator/info` respondia `200` com corpo vazio.
- Correção: habilitado `management.info.env.enabled` e adicionado teste de regressão.
- Reteste: aprovado.

### B1.07 — PostgreSQL

- Driver PostgreSQL configurado.
- Datasource aceita URL JDBC ou variáveis `DB_*`.
- Hibernate usa `ddl-auto: validate` e não altera o schema implicitamente.
- Resultado: aprovado.

### B1.08 — Flyway

- Flyway habilitado com baseline para o schema legado.
- Migrações versionadas localizadas em `db/migration`.
- Banco Docker confirmado na versão `v2`.
- Resultado: aprovado.

### B1.09 — Perfil de teste

- Perfil `test` usa banco H2 isolado e porta aleatória.
- Resultado: aprovado.

### B1.10 — PostgreSQL real nos testes

- Testcontainers com PostgreSQL 16 valida conexão e Flyway fora do H2.
- Resultado: aprovado.

### B1.11 — Imagem Docker

- Build multi-stage com Maven/Temurin 21.
- Runtime reduzido em Temurin JRE 21.
- Processo executado como usuário `spring`, UID 100, sem root.
- Resultado: aprovado.

### B1.12 — Compose standalone

- Arquivo validado por `docker compose config`.
- PostgreSQL exposto em `5433` e API em `8080`.
- API aguarda o healthcheck do PostgreSQL antes de iniciar.
- Resultado: aprovado.

### B1.13 — Documentação operacional

- README cobre pré-requisitos, Maven Wrapper, execução local, Docker, health e info.
- Texto do Flyway atualizado para refletir o estado implementado.
- Resultado: aprovado.

### B1.14 — Build reproduzível e higiene

- Wrappers Windows/Unix, `.gitignore` e `.dockerignore` presentes.
- Nenhum segredo ou artefato de build incluído.
- Resultado: aprovado.

## Evidências finais

- `mvnw.cmd clean verify`: **23 testes, 0 falhas, 0 erros e 0 ignorados**.
- JAR executável Spring Boot: gerado com sucesso.
- Imagem Docker: construída com sucesso.
- PostgreSQL 16 no Compose: `healthy`.
- `/actuator/health`: `UP`.
- `/actuator/info`: nome `FabrinMarket API` e estágio `foundation` presentes.
- Flyway: schema confirmado em `v2`.
- Container Java: UID 100, sem root.
- Containers e rede de teste removidos após a validação.
- Volume `java_postgres_data` preservado.
