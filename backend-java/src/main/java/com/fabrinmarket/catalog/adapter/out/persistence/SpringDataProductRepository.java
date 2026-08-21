package com.fabrinmarket.catalog.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

interface SpringDataProductRepository extends JpaRepository<ProductJpaEntity, Integer> {
    List<ProductJpaEntity> findBySellerIdOrderByIdDesc(Integer sellerId);
}
