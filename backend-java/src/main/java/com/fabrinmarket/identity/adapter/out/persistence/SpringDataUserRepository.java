package com.fabrinmarket.identity.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

interface SpringDataUserRepository extends JpaRepository<UserJpaEntity, Integer> {

    @Query("select user from UserJpaEntity user where lower(trim(user.email)) = :email")
    Optional<UserJpaEntity> findByNormalizedEmail(@Param("email") String normalizedEmail);

    @Query("""
            select (count(user) > 0)
            from UserJpaEntity user
            where lower(trim(user.email)) = :email and user.id <> :excludedId
            """)
    boolean existsByNormalizedEmailAndIdNot(
            @Param("email") String normalizedEmail,
            @Param("excludedId") Integer excludedId
    );
}
