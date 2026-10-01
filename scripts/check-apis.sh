#!/bin/bash
# Quick API Status Check
# Tests all 9 Polymath endpoints to verify they're working

ENDPOINT="https://viridian.vercel.app/api"

echo "🚀 Polymath API Status Check"
echo "============================"
echo ""

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_endpoint() {
  local path=$1
  local name=$2

  echo -n "Testing $name... "

  # Get status code and response
  HTTP_CODE=$(curl -s -o /tmp/response.json -w "%{http_code}" "$ENDPOINT$path")

  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✅ $HTTP_CODE${NC}"
  elif [ "$HTTP_CODE" = "404" ]; then
    echo -e "${YELLOW}⚠️  404 (Not Found - may be OK if no data)${NC}"
  elif [ "$HTTP_CODE" = "401" ]; then
    echo -e "${YELLOW}⚠️  401 (Unauthorized - auth required)${NC}"
  elif [ "$HTTP_CODE" = "500" ]; then
    echo -e "${RED}❌ 500 (Server Error - BLOCKER)${NC}"
    echo "   Response:"
    cat /tmp/response.json | head -5
  else
    echo -e "${RED}❌ $HTTP_CODE (Unexpected)${NC}"
  fi
}

echo "Checking endpoints..."
echo ""

# Test all 9 endpoints
check_endpoint "/communities" "GET /api/communities"
check_endpoint "/communities/test-slug" "GET /api/communities/[slug]"
check_endpoint "/communities/test-slug/discussions" "GET /api/communities/[slug]/discussions"
check_endpoint "/communities/test-slug/discussions/test-id" "GET /api/communities/[slug]/discussions/[id]"
check_endpoint "/communities/test-slug/discussions/test-id/messages" "GET /api/communities/[slug]/discussions/[id]/messages"
check_endpoint "/communities/test-slug/meetings" "GET /api/communities/[slug]/meetings"
check_endpoint "/communities/test-slug/resources" "GET /api/communities/[slug]/resources"
check_endpoint "/communities/test-slug/members" "GET /api/communities/[slug]/members"
check_endpoint "/me/profile" "GET /api/me/profile"

echo ""
echo "============================"
echo "Summary:"
echo "- ${GREEN}Green = Working${NC}"
echo "- ${YELLOW}Yellow = Auth required or not found${NC}"
echo "- ${RED}Red = Server error (needs fix)${NC}"
