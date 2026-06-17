package com.twelveweekyear;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/** Smoke test: the entire Spring context must boot (against the in-memory H2 test profile). */
@SpringBootTest
@ActiveProfiles("test")
class BackendApplicationTests {

    @Test
    void contextLoads() {
    }
}
