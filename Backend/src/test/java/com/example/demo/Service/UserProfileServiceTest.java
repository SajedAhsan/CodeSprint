package com.example.demo.Service;

import com.example.demo.Repository.UserProfileRepository;
import com.example.demo.dto.ProfileSolvesDto;
import com.example.demo.dto.UserProfileDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserProfileServiceTest {

    @Mock
    private UserProfileRepository userProfileRepository;

    @InjectMocks
    private UserProfileService userProfileService;

    @Test
    void getProfileByNumericIdentifierFindsUserById() {
        UserProfileDto dto = new UserProfileDto(
                10,
                "john_doe",
                "USER",
                false,
                42,
                15,
                new ProfileSolvesDto(10, 5, 2),
                17,
                100);

        when(userProfileRepository.findProfileByUserId(10)).thenReturn(Optional.of(dto));

        UserProfileDto result = userProfileService.getProfile("10");

        assertNotNull(result);
        assertEquals(10, result.userId());
        assertEquals("john_doe", result.username());
        assertEquals(42, result.totalLikes());
        assertEquals(15, result.upvotes());
        assertEquals(17, result.totalSolved());
        assertEquals(100, result.totalProblems());
        assertEquals(10, result.solves().easy());
        assertEquals(5, result.solves().medium());
        assertEquals(2, result.solves().hard());
    }

    @Test
    void getProfileByStringIdentifierFindsUserByUsername() {
        UserProfileDto dto = new UserProfileDto(
                12,
                "alice",
                "USER",
                true,
                100,
                50,
                new ProfileSolvesDto(20, 15, 5),
                40,
                150);

        when(userProfileRepository.findProfileByUsername("alice")).thenReturn(Optional.of(dto));

        UserProfileDto result = userProfileService.getProfile("alice");

        assertNotNull(result);
        assertEquals("alice", result.username());
        assertEquals(40, result.totalSolved());
    }

    @Test
    void getProfileNotFoundThrowsException() {
        when(userProfileRepository.findProfileByUserId(999)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> userProfileService.getProfile("999"));
    }
}
