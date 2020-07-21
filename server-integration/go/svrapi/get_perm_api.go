package svrapi

import (
	"encoding/json"

	"github.com/casbin/casbin"
)

func GetPermissionForUser(e *casbin.Enforcer, user string) ([]byte, error) {
	policy, err := e.GetImplicitPermissionsForUser(user)
	if err != nil {
		return nil, err
	}
	permission := make(map[string][]string)
	for i := 0; i < len(policy); i++ {
		permission[policy[i][2]] = append(permission[policy[i][2]], policy[i][1])
	}
	b, _ := json.Marshal(permission)
	return b, nil
}
