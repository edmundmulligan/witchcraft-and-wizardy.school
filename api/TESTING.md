# API Testing with Postman/Newman

This directory contains a Postman collection for automated testing of the API endpoints.

## Files

- **postman-collection.json** - Postman collection with all API tests
- **postman-environment.json** - Environment variables for tests
- **test-results.json** - Generated test results (created after running tests)

## Setup

### 1. Install Newman

Newman is the command-line runner for Postman collections. It's included as a dev dependency:

```bash
npm install
```

### 2. Start the API Server

The API server must be running before executing tests:

```bash
# In a separate terminal
npm run api
```

This starts the server on `http://localhost:3000`.

## Running Tests

### Command Line

Run all API tests:

```bash
npm run tests:api
```

This will:
- Execute all requests in the collection
- Run test assertions
- Display results in the terminal
- Generate a JSON report in `api/test-results.json`

### Expected Output

```
→ Health Check
  GET http://localhost:3000/api/health [200 OK, 234B, 15ms]
  ✓  Status code is 200
  ✓  Response has correct structure
  ✓  Status is ok
  ✓  Timestamp is valid ISO 8601
  ✓  Uptime is a positive number

→ Send Feedback - Valid Minimal
  POST http://localhost:3000/api/send-feedback [200 OK, 345B, 125ms]
  ✓  Status code is 200
  ✓  Response indicates success
  ✓  Response has message
  ✓  Response has messageId or info

...

┌─────────────────────────┬──────────┬──────────┐
│                         │ executed │   failed │
├─────────────────────────┼──────────┼──────────┤
│              iterations │        1 │        0 │
├─────────────────────────┼──────────┼──────────┤
│                requests │        6 │        0 │
├─────────────────────────┼──────────┼──────────┤
│            test-scripts │        6 │        0 │
├─────────────────────────┼──────────┼──────────┤
│      prerequest-scripts │        0 │        0 │
├─────────────────────────┼──────────┼──────────┤
│              assertions │       28 │        0 │
└─────────────────────────┴──────────┴──────────┘
```

## Test Coverage

The collection includes tests for:

### 1. Health Check (GET /api/health)
- ✓ Returns 200 status code
- ✓ Response structure is correct
- ✓ Status is "ok"
- ✓ Timestamp is valid ISO 8601
- ✓ Uptime is positive number

### 2. Send Feedback - Valid Minimal (POST /api/send-feedback)
- ✓ Returns 200 for valid minimal request
- ✓ Response indicates success
- ✓ Response includes success message
- ✓ Response includes messageId or info

### 3. Send Feedback - Full with CC and Attachment
- ✓ Returns 200 for full request
- ✓ Handles CC field correctly
- ✓ Handles JSON attachment

### 4. Validation Tests
- ✓ Returns 400 for missing required fields
- ✓ Returns 400 for invalid email format
- ✓ Error messages are descriptive

### 5. 404 Handling
- ✓ Returns 404 for non-existent endpoints
- ✓ Error message is appropriate

## Using with Postman GUI

You can also import the collection into Postman desktop app:

1. Open Postman
2. Click **Import**
3. Select `api/postman-collection.json`
4. Optionally import `api/postman-environment.json` for environment variables
5. Select the environment in the top-right dropdown
6. Click **Run Collection** to execute all tests

## Customizing Tests

### Changing the Base URL

Edit `postman-environment.json`:

```json
{
  "key": "baseUrl",
  "value": "https://api.witchcraft-and-wizardry.school",
  ...
}
```

Or override in the command line:

```bash
newman run api/postman-collection.json \
  --env-var "baseUrl=https://api.witchcraft-and-wizardry.school"
```

### Adding New Tests

Edit `postman-collection.json` to add new requests and test scripts. Test scripts use JavaScript with Chai assertions:

```javascript
pm.test('Status code is 200', function () {
    pm.response.to.have.status(200);
});

pm.test('Response has expected property', function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('propertyName');
});
```

## CI/CD Integration

The tests can be integrated into CI/CD pipelines:

### GitHub Actions Example

```yaml
name: API Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm install
      - run: npm run api &
      - run: sleep 5  # Wait for server to start
      - run: npm run tests:api
```

## Troubleshooting

### Server Not Running

If tests fail with connection errors:

```
Error: connect ECONNREFUSED 127.0.0.1:3000
```

Start the API server first:

```bash
npm run api
```

### Port Already in Use

If port 3000 is already in use, set a different port:

```bash
PORT=3001 npm run api
```

Then update the environment variable in tests:

```bash
newman run api/postman-collection.json \
  --env-var "baseUrl=http://localhost:3001"
```

### Rate Limiting

The API has rate limiting. If you run tests too frequently, you may get 429 errors. Wait 15 minutes or increase the rate limit in the API configuration.

## Documentation

- [Newman Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/)
- [Postman Test Scripts](https://learning.postman.com/docs/writing-scripts/test-scripts/)
- [Chai Assertion Library](https://www.chaijs.com/api/bdd/)
