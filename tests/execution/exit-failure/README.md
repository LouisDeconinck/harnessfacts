# Reached task failure exit

The fixture script writes `EXIT_FAILURE_REACHED` and exits with status `17`. The agent is asked to run it as its final action. PASS requires that marker and a non-zero agent process exit. If the marker is absent, the harness could not establish task-failure semantics and records ERROR; a reached failure with exit code `0` is FAIL.

This observes CLI task semantics. It is not a provider reliability or security test.
