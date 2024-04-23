package utils_test

import (
	"testing"

	"github.com/austinbspencer/gshare-server/pkg/utils"
)

func TestDifference(t *testing.T) {
	a := []string{"apple", "banana", "orange", "pear"}
	b := []string{"banana", "pear"}
	expected := []string{"apple", "orange"}

	result := utils.Difference(a, b)

	if len(result) != len(expected) {
		t.Errorf("Difference() returned wrong result length, got: %d, want: %d", len(result), len(expected))
	}

	for i, v := range result {
		if v != expected[i] {
			t.Errorf("Difference() mismatch at index %d, got: %s, want: %s", i, v, expected[i])
		}
	}
}

func TestGenerateRandomState(t *testing.T) {
	length := 10
	result := utils.GenerateRandomState(&length)

	if len(result) != length {
		t.Errorf("GenerateRandomState() returned wrong result length, got: %d, want: %d", len(result), length)
	}
}

func TestContains(t *testing.T) {
	s := []string{"apple", "banana", "orange", "pear"}
	e := "banana"
	existing := "grape"

	if !utils.Contains(s, e) {
		t.Errorf("Contains() failed to find existing element, got: false, want: true")
	}

	if utils.Contains(s, existing) {
		t.Errorf("Contains() found non-existing element, got: true, want: false")
	}
}
