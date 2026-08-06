#!/bin/bash

BASE_URL="http://localhost:3001/api/polymath"

echo "🚀 Creating 100 test articles..."
START_TIME=$(date +%s%N)

# Create 100 articles with mix of types
for i in {1..100}; do
  TYPE=$((i % 4))  # Cycle through 0-3

  if [ $TYPE -eq 0 ]; then
    # Individual article (25%)
    curl -s -X POST "$BASE_URL/articles" \
      -H "Content-Type: application/json" \
      -H "X-Test-User-Id: user-$((i % 10))" \
      -d "{\"title\":\"Load Test Article $i\",\"content\":\"Content for article $i with detailed information about the topic. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\",\"abstract\":\"Summary $i\",\"authorType\":\"individual\",\"authorId\":\"user-$((i % 10))\",\"visibility\":\"public\",\"topic\":\"education\"}" > /dev/null
  else
    # Org articles (75%)
    curl -s -X POST "$BASE_URL/articles" \
      -H "Content-Type: application/json" \
      -H "X-Test-User-Id: org-admin-1" \
      -d "{\"title\":\"Load Test Org Article $i\",\"content\":\"Organization content $i with detailed information. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\",\"authorType\":\"individual\",\"authorId\":\"org-test-user-$((i % 10))\",\"visibility\":\"public\",\"topic\":\"education\"}" > /dev/null
  fi

  if [ $((i % 25)) -eq 0 ]; then echo "  Created $i articles"; fi
done

END_TIME=$(date +%s%N)
ELAPSED_NS=$((END_TIME - START_TIME))
ELAPSED_MS=$((ELAPSED_NS / 1000000))
ELAPSED_S=$((ELAPSED_MS / 1000))
echo "✅ Created 100 articles in ${ELAPSED_S}s (${ELAPSED_MS}ms)"
