Here is where you place all .json files that contain the contents of the quests. They should have the same format as quests.json in aki-data/server/database/templates/.
There is no required name for these files, nor is there a set amount of quests you can have in each file.

The only additional properties that can be added are

	"startMonth": 6,
	"endMonth: 12
	"startDay": 1,
	"endDay": 31

This allows you to create seasonal quests (The values here for example would only have the task available from June to December.)
