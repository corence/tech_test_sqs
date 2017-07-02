The files in this folder are as follows:

sqs.js -- This is a quick proof of concept to make sure I had a correct understanding of the SDK.
assertions.js -- I had some trouble getting mocha installed, so I rolled a quick test framework so I could get back to focusing on the task.
sqs_utils.js -- This took some of the boilerplate logic out of the test code to make the logic a bit clearer and easier to read/write.

planning_integration.txt -- This was my initial plans for high-level test scenarios.
test_integration.js -- This has a single test scenario that tries to provoke race conditions by interleaving reads and writes.

planning_unit.txt -- This lists some areas worth unit testing in the SendMessage API call.
test_unit.js -- This goes into SendMessage and tests some of the edge cases listed in the documentation.


Breakdown of activities:
 - I started by setting up the AWS SDK and creating sqs.js to make sure I had everything correct. It worked quickly.
 - Then, after some hassle trying to install the test framework (I'm not sure what happened -- maybe because I'm on tethered internet at home) I made assertions.js
 - I think the most interesting and potentially harmful bugs in SQS would be found in its interactions between multiple clients -- if there's a race condition, it would be hard to detect but devastating in its impact. Thus, I planned some integration tests and created test_integration.js
 - Next, I re-checked the assigned task and realised that it seemed to be calling for more in-depth testing of each individual endpoint in the API, rather than full-scale integration testing. So, I looked into SendMessage and created test_unit.js
 - I spent the rest of my time adding cases to test_unit.js and refactoring out some common parts into sqs_utils.js

I'll note that although I didn't find any bugs in the integration test, my "unit" tests (I guess "unit" is an incorrect label, maybe "component" would have been better) seem to be finding a lot of issues where the behaviour contradicts the docs.

I suspect that most of the errors that I'm finding are bugs in ElasticMQ rather than SQS, because in my experience AWS endpoints tend to be quite strict in their validation.

So in conclusion -- I'm actually finding ElasticMQ to be of limited value when testing against edge cases in the SQS documentation -- if I were to continue this project, I'd probably be looking to cut ElasticMQ out of the picture and test directly against SQS.


Future activity:
If I had a couple of weeks on this task instead of 4 hours, I'd be looking to expand as follows:
 - Verify that the 5 failing tests that I currently have are actually bugs in ElasticMQ, and not errors that I've made
 - Use a real test framework -- probably mocha + chai
 - Get running against SQS -- it has to happen eventually, but I'd also be looking into getting rid of ElasticMQ
 - Continue covering the core functions of SQS
 - Test the features that I made use of but didn't fully test -- such as receiveMessage's WaitTimeSeconds, purgeQueue, and deleteMessage
 - Continue integration testing! I'd really like to create tests where we run multiple node processes, so we can actually send and receive multiple messages *at the same time* -- our current test can't do that because it's running in the javascript event loop. I'd also like to throw in some more operations such as reading messages but failing to delete them, deleting queues, and making use of the dead letter queue.
