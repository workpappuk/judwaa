package com.waajud.judwaa.shared;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.mockito.Mockito;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

class BaseEntityTest {

    static class TestEntity extends BaseEntity {
        void invokeOnCreate() {
            onCreate();
        }

        void invokeOnUpdate() {
            onUpdate();
        }
    }

    @AfterEach
    void cleanContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void onCreate_withoutAuth_defaultsSystemAndActive() {
        TestEntity entity = new TestEntity();
        entity.setCreatedBy("");
        entity.setUpdatedBy("");
        entity.setStatus(null);

        entity.invokeOnCreate();

        assertNotNull(entity.getId());
        assertNotNull(entity.getCreatedAt());
        assertNotNull(entity.getUpdatedAt());
        assertEquals("SYSTEM", entity.getCreatedBy());
        assertEquals("SYSTEM", entity.getUpdatedBy());
        assertEquals(RecordStatus.ACTIVE, entity.getStatus());
    }

    @Test
    void onCreate_withAuthenticatedUser_setsActor() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("alice", "pwd", java.util.List.of()));
        TestEntity entity = new TestEntity();
        entity.setCreatedBy("");
        entity.setUpdatedBy("");

        entity.invokeOnCreate();

        assertEquals("alice", entity.getCreatedBy());
        assertEquals("alice", entity.getUpdatedBy());
    }

    @Test
    void onCreate_preservesExistingCreatorUpdaterAndStatus() {
        TestEntity entity = new TestEntity();
        entity.setCreatedBy("seed");
        entity.setUpdatedBy("seed2");
        entity.setStatus(RecordStatus.INACTIVE);

        entity.invokeOnCreate();

        assertEquals("seed", entity.getCreatedBy());
        assertEquals("seed2", entity.getUpdatedBy());
        assertEquals(RecordStatus.INACTIVE, entity.getStatus());
    }

    @Test
    void onUpdate_setsUpdatedByFromActor() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("bob", "pwd", java.util.List.of()));
        TestEntity entity = new TestEntity();

        entity.invokeOnUpdate();

        assertEquals("bob", entity.getUpdatedBy());
        assertNotNull(entity.getUpdatedAt());
    }

    @Test
    void onUpdate_withAnonymous_setsSystem() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("anonymousUser", "pwd", java.util.List.of()));
        TestEntity entity = new TestEntity();

        entity.invokeOnUpdate();

        assertEquals("SYSTEM", entity.getUpdatedBy());
    }

    @Test
    void onUpdate_withUnauthenticatedPrincipal_setsSystem() {
        Authentication auth = Mockito.mock(Authentication.class);
        Mockito.when(auth.isAuthenticated()).thenReturn(false);
        SecurityContextHolder.getContext().setAuthentication(auth);
        TestEntity entity = new TestEntity();

        entity.invokeOnUpdate();

        assertEquals("SYSTEM", entity.getUpdatedBy());
    }

    @Test
    void onUpdate_withBlankPrincipalName_setsSystem() {
        Authentication auth = Mockito.mock(Authentication.class);
        Mockito.when(auth.isAuthenticated()).thenReturn(true);
        Mockito.when(auth.getName()).thenReturn("");
        SecurityContextHolder.getContext().setAuthentication(auth);
        TestEntity entity = new TestEntity();

        entity.invokeOnUpdate();

        assertEquals("SYSTEM", entity.getUpdatedBy());
    }

    @Test
    void onUpdate_withNullPrincipalName_setsSystem() {
        Authentication auth = Mockito.mock(Authentication.class);
        Mockito.when(auth.isAuthenticated()).thenReturn(true);
        Mockito.when(auth.getName()).thenReturn(null);
        SecurityContextHolder.getContext().setAuthentication(auth);
        TestEntity entity = new TestEntity();

        entity.invokeOnUpdate();

        assertEquals("SYSTEM", entity.getUpdatedBy());
    }

    @Test
    void onCreate_withNullAuditUsers_setsSystem() {
        TestEntity entity = new TestEntity();
        entity.setCreatedBy(null);
        entity.setUpdatedBy(null);

        entity.invokeOnCreate();

        assertEquals("SYSTEM", entity.getCreatedBy());
        assertEquals("SYSTEM", entity.getUpdatedBy());
    }
}
