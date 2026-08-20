package com.fabrinmarket.identity.adapter.out.persistence;

import com.fabrinmarket.identity.application.port.out.UserRepositoryPort;
import com.fabrinmarket.identity.domain.exception.EmailAlreadyInUseException;
import com.fabrinmarket.identity.domain.model.EmailAddress;
import com.fabrinmarket.identity.domain.model.User;
import com.fabrinmarket.identity.domain.model.UserName;
import com.fabrinmarket.identity.domain.model.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Testcontainers
@DataJpaTest(properties = {
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.flyway.enabled=true",
        "spring.flyway.baseline-on-migrate=true",
        "spring.flyway.baseline-version=0"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(UserPersistenceAdapter.class)
class UserPersistenceAdapterTests {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
            .withInitScript("legacy-users.sql");

    @DynamicPropertySource
    static void configureDataSource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Autowired
    private UserRepositoryPort users;

    @Test
    void readsTheLegacyUserWithoutChangingItsBcryptHash() {
        var legacy = users.findByEmail("admin.legado@example.com").orElseThrow();

        assertThat(legacy.role()).isEqualTo(UserRole.ADMIN);
        assertThat(legacy.passwordHash()).isEqualTo(
                "$2b$10$cCiru23si.gcSz3ogTW4EeSP.Ri8aRBBhkVOYgW62EIfH1Dm.gUyq"
        );
    }

    @Test
    void PersistsAndUpdatesTheDomainUser() {
        var created = users.save(new User(
                null,
                new UserName("Maria Silva"),
                new EmailAddress("maria@example.com"),
                "$2b$10$hash-de-teste",
                UserRole.CUSTOMER,
                LocalDateTime.of(2026, 8, 19, 12, 0)
        ));

        assertThat(created.id()).isPositive();
        assertThat(users.findById(created.id())).contains(created);
        assertThat(users.existsByEmailAndIdNot("maria@example.com", created.id())).isFalse();
    }

    @Test
    void rejectsEmailsThatOnlyDifferByCase() {
        assertThatThrownBy(() -> users.save(new User(
                null,
                new UserName("Outro Admin"),
                new EmailAddress("ADMIN.LEGADO@example.com"),
                "$2b$10$outro-hash",
                UserRole.CUSTOMER,
                LocalDateTime.of(2026, 8, 19, 12, 0)
        ))).isInstanceOf(EmailAlreadyInUseException.class);
    }
}
