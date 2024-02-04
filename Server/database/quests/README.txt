Here is where you place all .json files that contain the contents of the quests. They should have the same format as quests.json in aki-data/server/database/templates/. There is no required name and you can call them whatever you like.

The only additional properties that can be added are

	"startMonth": 12,
	"startDay": 1,
	"endDay": 31

This allows you to create seasonal quests (The values here for example would only have the task available during the month of december.)

Quests can be accross multiple files and you can have each json with 20 quests for example. 
