Breakdown of activities:
1) I started by setting up the AWS SDK and creating sqs.js to make sure I had everything correct. It worked quickly.
2) I think the most interesting and potentially harmful bugs in SQS would be found in its interactions between multiple clients, for a few reasons:
 -- Without talking to the developers, I'd guess that their own testing covers endpoints in isolation much more than testing the whole system
 -- If there's a bug in an individual endpoint, it's (relatively) likely that either the implementor, or the client developer, may pick it up
 -- If there's some kind of race condition or other bug that only comes up with many parallel clients, it's difficult to "accidentally stumble upon" this bug -- it's likely to only come up when a big client starts using SQS for a big workload.
 Based on the above, I created planning_integration.js and test_integration.js to cover at least one case in this direction.
3) Next, I re-checked the assigned task and realised that it seemed to be calling for more in-depth testing of each individual endpoint in the API, rather than full-scale integration testing. So, I looked into SendMessage and created planning_unit.txt and test_unit.js -- focusing first on SendMessage.
4) I spent the rest of my time adding cases to test_unit.js and refactoring out some common parts into sqs_utils.js

Results:
Firstly, I suppose my term of "unit" tests isn't really accurate -- "component" tests or even "endpoint" tests would probably have been better.

The integration test didn't find any bugs, although I had to debug it to get it running, which increased my confidence in its results.

The unit tests have failing assertions. The first one is -- the endpoint is failing to reject input that goes over the limits in the documentation. I suspect that ElasticMQ doesn't implement as many validations as SQS does -- which makes sense.

The others are failing for anything other than basic ASCII. So it seems that either:
 - ElasticMQ is failing at unicode
 - the Javascript SDK is failing at Unicode
 - or my tests have a bug.

Again, my intuition points to a bug in ElasticMQ here -- because in my experience, AWS products are strict in their validations. I didn't investigate further.


The files in this folder are as follows:

sqs.js -- This is a quick proof of concept to make sure I had a correct understanding of the SDK. It's not used in the tests.
assertions.js -- I had some trouble getting mocha installed, so I rolled a quick test framework so I could get back to focusing on the task.
sqs_utils.js -- This took some of the boilerplate logic out of the test code to make the logic a bit clearer and easier to read/write.

planning_integration.txt -- This was my initial plans for high-level test scenarios.
test_integration.js -- This has a single test scenario that tries to provoke race conditions by interleaving reads and writes.

planning_unit.txt -- This lists some areas worth unit testing in the SendMessage API call.
test_unit.js -- This goes into SendMessage and tests some of the edge cases listed in the documentation.



Future activity:
If I had a couple of weeks on this task instead of 4 hours, I'd be looking to expand as follows:
0) Research unicode with ElasticMQ to see if this is a known issue
1) Compare AWS with ElasticMQ to verify if the 5 failing tests that I currently have are actually bugs in ElasticMQ, or if not, debug them further
2) Use a real test framework -- probably mocha + chai
3) Continue adding coverage for the core functions of SQS
4) Test the features that I made use of but didn't fully test -- such as receiveMessage's WaitTimeSeconds, purgeQueue, and deleteMessage
5) Continue end-to-end testing -- focusing on these areas:
 -- multiple clients operating in parallel (using multiple node processes so we can test with true parallelism)
 -- message visibility and deletion (the possibility of timing issues here could lead to some very high-value bugs)
 -- dead letter queue (as it's a semi-"obscure" function relative to the others, it's entirely possible a client developer may get into production without ever testing this)
