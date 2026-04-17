use assert_cmd::Command;

const JANUARY_2024_GOLDEN: &str = concat!(
    "        January         \n",
    "    Mo Tu We Th Fr Sa Su\n",
    "  1  1  2  3  4  5  6  7\n",
    "  2  8  9 10 11 12 13 14\n",
    "  3 15 16 17 18 19 20 21\n",
    "  4 22 23 24 25 26 27 28\n",
    "  5 29 30 31\n",
);

#[test]
fn no_args_renders_current_month_and_exits_zero() {
    let output = Command::cargo_bin("rust-cli-calendar")
        .expect("binary is built")
        .env("CAL_TEST_DATE", "2024-01-15")
        .assert()
        .success()
        .get_output()
        .stdout
        .clone();

    assert_eq!(
        std::str::from_utf8(&output).expect("utf-8 output"),
        JANUARY_2024_GOLDEN
    );
}

#[test]
fn extra_argument_is_rejected_with_usage_on_stderr() {
    Command::cargo_bin("rust-cli-calendar")
        .expect("binary is built")
        .env("CAL_TEST_DATE", "2024-01-15")
        .arg("--unexpected")
        .assert()
        .failure()
        .stderr(predicates::str::contains("usage: rust-cli-calendar"));
}

#[test]
fn stdout_is_plain_ascii_with_no_escape_codes() {
    let output = Command::cargo_bin("rust-cli-calendar")
        .expect("binary is built")
        .env("CAL_TEST_DATE", "2024-01-15")
        .assert()
        .success()
        .get_output()
        .stdout
        .clone();

    assert!(!output.contains(&0x1b), "ANSI escape code found in stdout");
    for &b in &output {
        assert!(
            b == b'\n' || (b' '..=b'~').contains(&b),
            "non-printable byte in stdout: {b:#x}"
        );
    }
}

#[test]
fn invalid_test_date_env_causes_non_zero_exit_and_stderr_message() {
    Command::cargo_bin("rust-cli-calendar")
        .expect("binary is built")
        .env("CAL_TEST_DATE", "not-a-date")
        .assert()
        .failure()
        .stderr(predicates::str::contains("invalid CAL_TEST_DATE"));
}
