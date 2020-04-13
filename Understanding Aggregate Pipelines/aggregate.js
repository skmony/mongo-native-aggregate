db.persons.aggregate([
    {
        $project: {
            _id: 0,
            name: 1,
            email: 1,
            birthdate: { $convert: { input: '$dob.date', to: 'date' } },
            age: "$dob.age",
            location: {
                type: 'Point',
                coordinates: [
                    {
                        $convert: {
                            input: '$location.coordinates.longitude',
                            to: 'double',
                            onError: 0.0,
                            onNull: 0.0
                        }
                    },
                    {
                        $convert: {
                            input: '$location.coordinates.latitude',
                            to: 'double',
                            onError: 0.0,
                            onNull: 0.0
                        }
                    }
                ]
            }
        }
    },
    {
        $project: {
            gender: 1,
            email: 1,
            location: 1,
            birthdate: 1,
            age: 1,
            fullName: {
                $concat: [
                    { $toUpper: { $substrCP: ['$name.first', 0, 1] } },
                    {
                        $substrCP: [
                            '$name.first',
                            1,
                            { $subtract: [{ $strLenCP: '$name.first' }, 1] }
                        ]
                    },
                    ' ',
                    { $toUpper: { $substrCP: ['$name.last', 0, 1] } },
                    {
                        $substrCP: [
                            '$name.last',
                            1,
                            { $subtract: [{ $strLenCP: '$name.last' }, 1] }
                        ]
                    }
                ]
            }
        }
    },
    { $group: { _id: { birthyear: { $isoWeekYear: "$birthdate" } }, numPersons: { $sum: 1 } } },
    { $sort: { numPersons: -1 } }
]).pretty();


db.friends.aggregate([
    { $unwind: '$hobbies' },
    { $group: { _id: { age: "$age" }, allHobbies: { $addToSet: "$hobbies" } } }
])

db.friends.aggregate([
    { $project: { _id: 0, examScore: { $slice: ["$examScores", 2, 1] } } }
]).pretty()

db.friends.aggregate([
    { $project: { _id: 0, numScores: { $size: "$examScores" } } }
]).pretty()

db.friends.aggregate([
    { $project: { _id: 0, scores: { $filter: { input: '$examScores', as: 'sc', cond: { $gt: ["$$sc.score", 60] } } } } }
]).pretty()

db.friends.aggregate([
    { $unwind: "$examScores" },
    { $project: { _id: 1, name: 1, age: 1, score: "$examScores.score" } },
    { $sort: { score: -1 } },
    { $group: { _id: "$_id", name: { $first: "$name" }, maxScore: { $max: "$score" } } },
    { $sort: { maxScore: -1 } }
]).pretty()

db.persons.aggregate([
    {
        $bucket: {
            groupBy: "$dob.age",
            boundaries: [18, 20, 30, 50, 60,80],
            output: {
                numPersons: { $sum: 1 },
                averageAge: { $avg: "$dob.age" },
            }
        }
    }
]).pretty()

db.persons.aggregate([
    {
        $bucketAuto: {
            groupBy: "$dob.age",
            buckets:30,
            output: {
                numPersons: { $sum: 1 },
                averageAge: { $avg: "$dob.age" },
            }
        }
    }
]).pretty()

db.persons.aggregate([
    {$match:{gender:"male"}},
    { $project:{_id:0,gender:1,name:{$concat:["$name.first"," ","$name.last"]},birthdate:{$toDate:"$dob.date"}}},
    {$sort:{birthdate:1}},
    {$skip:10},
    {$limit:10}
]).pretty()


db.persons.aggregate([
    {
        $project: {
            _id: 0,
            name: 1,
            email: 1,
            birthdate: { $convert: { input: '$dob.date', to: 'date' } },
            age: "$dob.age",
            location: {
                type: 'Point',
                coordinates: [
                    {
                        $convert: {
                            input: '$location.coordinates.longitude',
                            to: 'double',
                            onError: 0.0,
                            onNull: 0.0
                        }
                    },
                    {
                        $convert: {
                            input: '$location.coordinates.latitude',
                            to: 'double',
                            onError: 0.0,
                            onNull: 0.0
                        }
                    }
                ]
            }
        }
    },
    {
        $project: {
            gender: 1,
            email: 1,
            location: 1,
            birthdate: 1,
            age: 1,
            fullName: {
                $concat: [
                    { $toUpper: { $substrCP: ['$name.first', 0, 1] } },
                    {
                        $substrCP: [
                            '$name.first',
                            1,
                            { $subtract: [{ $strLenCP: '$name.first' }, 1] }
                        ]
                    },
                    ' ',
                    { $toUpper: { $substrCP: ['$name.last', 0, 1] } },
                    {
                        $substrCP: [
                            '$name.last',
                            1,
                            { $subtract: [{ $strLenCP: '$name.last' }, 1] }
                        ]
                    }
                ]
            }
        }
    },
    { $group: { _id: { birthyear: { $isoWeekYear: "$birthdate" } }, numPersons: { $sum: 1 } } },
    { $sort: { numPersons: -1 } },
    {$out:"transformedPersons"}
]).pretty();


db.transformedPersons.aggregate([
    {$geoNear:{
        near:{type:"Point",coordinates:[-18.4,-42.8]},
        maxDistance:100000,
        query:{age:{$gt:30}},
        distanceField:"distance"
    }
    },
    {$limit:10}
])

db.createCollection("newCollection",{capped:true,size:10000,max:3})
