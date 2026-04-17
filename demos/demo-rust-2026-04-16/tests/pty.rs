//! PTY-based integration tests that exercise the TTY code path end-to-end.
//!
//! The other integration tests in `tests/cli.rs` inherit a piped stdout from
//! `assert_cmd`, so `io::stdout().is_terminal()` always returns `false`
//! there. These tests spawn the binary under a real pseudo-terminal so the
//! binary observes `is_tty == true` and emits ANSI SGR sequences — giving us
//! automated coverage of UC1-S3 / UC2-S3 / UC1-S5 / UC2-S5.

use std::io::Read;

use portable_pty::{native_pty_system, CommandBuilder, PtySize};

fn run_under_pty(cal_test_date: &str) -> Vec<u8> {
    let pty_system = native_pty_system();
    let pair = pty_system
        .openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })
        .expect("openpty");

    let exe = assert_cmd::cargo::cargo_bin("rust-cli-calendar");
    let mut cmd = CommandBuilder::new(exe);
    cmd.env("CAL_TEST_DATE", cal_test_date);

    let mut child = pair.slave.spawn_command(cmd).expect("spawn command");

    // Drop our slave handle so the PTY master sees EOF once the child exits
    // (otherwise `read_to_end` would block forever).
    drop(pair.slave);

    let mut reader = pair
        .master
        .try_clone_reader()
        .expect("clone master reader");
    let mut buf = Vec::new();
    reader.read_to_end(&mut buf).expect("read pty output");

    let status = child.wait().expect("child wait");
    assert!(
        status.success(),
        "binary exited non-zero under PTY: {status:?}"
    );
    buf
}

fn contains(haystack: &[u8], needle: &[u8]) -> bool {
    haystack.windows(needle.len()).any(|w| w == needle)
}

#[test]
fn pty_run_emits_sgr_sequences_when_stdout_is_a_tty() {
    // UC1-S3 / UC2-S3: when stdout is a real TTY, the renderer must emit SGR.
    // Jan 15, 2024 is a Monday with several weekends in the rendered month,
    // so at minimum we expect a "\x1b[" prefix somewhere in the output.
    let out = run_under_pty("2024-01-15");
    assert!(
        contains(&out, b"\x1b["),
        "expected at least one SGR introducer '\\x1b[' under PTY; got:\n{}",
        String::from_utf8_lossy(&out)
    );
}

#[test]
fn pty_run_wraps_today_cell_in_reverse_video_when_today_is_a_weekday() {
    // UC1-S5: today = 2024-01-15 (Monday, weekday). Expect exactly the
    // reverse-video pair around " 1", " 5" → "15".
    let out = run_under_pty("2024-01-15");
    assert!(
        contains(&out, b"\x1b[7m15\x1b[0m"),
        "expected reverse-video today cell '\\x1b[7m15\\x1b[0m' in PTY output; got:\n{}",
        String::from_utf8_lossy(&out)
    );
    assert!(
        !contains(&out, b"\x1b[1;7m15\x1b[0m"),
        "Jan 15 2024 is a Monday (not weekend) — no combined SGR expected; got:\n{}",
        String::from_utf8_lossy(&out)
    );
}

#[test]
fn pty_run_uses_combined_sgr_when_today_is_a_weekend() {
    // UC2-S5 / UC2-E5a: today = 2024-01-07 (Sunday). Expect exactly the
    // combined bold+reverse pair.
    let out = run_under_pty("2024-01-07");
    assert!(
        contains(&out, b"\x1b[1;7m 7\x1b[0m"),
        "expected combined SGR '\\x1b[1;7m 7\\x1b[0m' for Sunday-today under PTY; got:\n{}",
        String::from_utf8_lossy(&out)
    );
    assert!(
        !contains(&out, b"\x1b[7m 7\x1b[0m"),
        "no standalone reverse-video expected for Sunday-today; got:\n{}",
        String::from_utf8_lossy(&out)
    );
    assert!(
        !contains(&out, b"\x1b[1m 7\x1b[0m"),
        "no standalone bold expected for Sunday-today; got:\n{}",
        String::from_utf8_lossy(&out)
    );
}

#[test]
fn pty_run_wraps_every_weekend_day_in_bold() {
    // UC2-S4: Jan 6 (Sat), Jan 7 (Sun), Jan 13, 14, 20, 21, 27, 28 — all are
    // weekend days of January 2024. With today=Jan 15 (Monday), each weekend
    // cell should be wrapped in a bold SGR pair.
    let out = run_under_pty("2024-01-15");
    for d in [6u32, 7, 13, 14, 20, 21, 27, 28] {
        let needle = format!("\x1b[1m{d:>2}\x1b[0m");
        assert!(
            contains(&out, needle.as_bytes()),
            "expected weekend cell {needle:?} in PTY output for day {d}; got:\n{}",
            String::from_utf8_lossy(&out)
        );
    }
}
