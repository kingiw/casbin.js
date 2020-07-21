package svrapi

import (
	"encoding/json"
	"testing"

	"github.com/casbin/casbin"
)

func contains(arr []string, target string) bool {
	for _, item := range arr {
		if item == target {
			return true
		}
	}
	return false
}

func TestGetPermissionForUser(t *testing.T) {
	e, _ := casbin.NewEnforcer("../example/model.conf", "../example/policy.csv")
	target_str, _ := GetPermissionForUser(e, "alice")
	target := make(map[string][]string)
	err := json.Unmarshal(target_str, &target)
	if err != nil {
		t.Errorf("Test error: %s", err)
	}
	perm, ok := target["read"]
	if !ok {
		t.Errorf("Test error: Alice doesn't have read permission")
	}
	if !contains(perm, "data1") {
		t.Errorf("Test error: Alice cannot read data1")
	}
	if !contains(perm, "data2") {
		t.Errorf("Test error: Alice cannot read data2")
	}
	perm, ok = target["write"]
	if !ok {
		t.Errorf("Test error: Alice doesn't have write permission")
	}
	if !contains(perm, "data1") {
		t.Errorf("Test error: Alice cannot write data1")
	}
	if !contains(perm, "data2") {
		t.Errorf("Test error: Alice cannot write data2")
	}

	target_str, _ = GetPermissionForUser(e, "bob")
	err = json.Unmarshal(target_str, &target)
	if err != nil {
		t.Errorf("Test error: %s", err)
	}
	perm, ok = target["read"]
	if !ok {
		t.Errorf("Test error: Bob doesn't have read permission")
	}
	perm, ok = target["write"]
	if !contains(perm, "data2") {
		t.Errorf("Test error: Bob cannot write data2")
	}
	if contains(perm, "data1") {
		t.Errorf("Test error: Bob can write data1")
	}
	if contains(perm, "data_not_exist") {
		t.Errorf("Test error: Bob can access a non-existing data")
	}

	perm, ok = target["rm_rf"]
	if ok {
		t.Errorf("Someone can have a non-existing action (rm -rf)")
	}
}
