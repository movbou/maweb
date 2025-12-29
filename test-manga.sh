#!/bin/bash

echo "🎬 Setting up and testing manga functionality..."
echo ""

# Step 1: Create test manga pages
echo "📚 Step 1: Creating test manga pages..."
node scripts/create-test-manga.js
echo ""

# Wait a bit for file creation
sleep 2

# Step 2: Verify files were created
echo "✅ Step 2: Verifying test files..."
if [ -d "public/manga/test/chapter1" ]; then
  CHAPTER1_COUNT=$(ls -1 public/manga/test/chapter1/*.jpg 2>/dev/null | wc -l)
  echo "  Chapter 1: $CHAPTER1_COUNT pages"
fi
if [ -d "public/manga/test/chapter2" ]; then
  CHAPTER2_COUNT=$(ls -1 public/manga/test/chapter2/*.jpg 2>/dev/null | wc -l)
  echo "  Chapter 2: $CHAPTER2_COUNT pages"
fi
if [ -d "public/manga/test/chapter3" ]; then
  CHAPTER3_COUNT=$(ls -1 public/manga/test/chapter3/*.jpg 2>/dev/null | wc -l)
  echo "  Chapter 3: $CHAPTER3_COUNT pages"
fi
echo ""

# Step 3: Check if server is running
echo "🔍 Step 3: Checking if server is running..."
if curl -s http://localhost:3000 > /dev/null; then
  echo "  ✓ Server is running on http://localhost:3000"
else
  echo "  ⚠️  Server is not running. Please start it with: npm run dev"
  echo ""
  exit 1
fi
echo ""

# Step 4: Test API endpoints
echo "🧪 Step 4: Testing API endpoints..."

echo "  Testing /api/manga/popular..."
if curl -s http://localhost:3000/api/manga/popular | grep -q "id"; then
  echo "    ✓ Popular manga API works"
else
  echo "    ✗ Popular manga API failed"
fi

echo "  Testing /api/manga/random..."
if curl -s http://localhost:3000/api/manga/random | grep -q "id"; then
  echo "    ✓ Random manga API works"
else
  echo "    ✗ Random manga API failed"
fi

echo "  Testing /api/manga/1/read/1..."
if curl -s http://localhost:3000/api/manga/1/read/1 | grep -q "pages"; then
  echo "    ✓ Chapter pages API works"
else
  echo "    ✗ Chapter pages API failed"
fi
echo ""

# Step 5: Run Playwright tests
echo "🎭 Step 5: Running Playwright tests..."
echo ""
npx playwright test tests/manga.spec.ts --reporter=list
TEST_RESULT=$?
echo ""

# Step 6: Show results
if [ $TEST_RESULT -eq 0 ]; then
  echo "✅ All tests passed!"
  echo ""
  echo "🎉 Manga functionality is working correctly!"
  echo ""
  echo "Try it yourself:"
  echo "  1. Open http://localhost:3000"
  echo "  2. Click 'Browse Manga' in the navbar"
  echo "  3. Browse manga and click 'Start Reading'"
  echo ""
else
  echo "❌ Some tests failed. Check the output above."
  echo ""
  echo "You can view the test report with:"
  echo "  npx playwright show-report"
  echo ""
fi

exit $TEST_RESULT
