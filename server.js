// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const formidable = require("express-formidable");
const Airtable = require('airtable');
const base = new Airtable(process.env.AIRTABLE_API_KEY).base('appKOowZ2KWj3yWI2');

const bodyParser = require("body-parser");
const app = express();

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
//app.use(express.static("public"));
app.use(formidable({
  encoding: 'utf-8',
  uploadDir: '/my/dir',
  multiples: true, // req.files to be arrays of files
})); 

//app.use(bodyParser.urlencoded({extended: true}));



app.post("/gcal/hooks", async function(req,res) {
  res.status(200).end();
  
  console.log("request =");
  console.log(req);
  console.log("request fields=");
  console.log(JSON.stringify(req.fields));

  
});





app.post("/jotform/hooks", async function(req,res) {
  //================= Parse JotForm request to JSON ===============================
  res.status(200);
  
  const fields = JSON.stringify(req.fields);
  console.log("req fields are = \n" + fields);
  
  const files = JSON.stringify(req.files);
  console.log("req files are = \n" + files);
  
  const raw = req.fields.rawRequest;
  console.log("raw is = \n" + raw);
    
  
  //๋JSON.parse เลยจะอ่านไม่ออก ต้อง stringify ก่อนเสมอ
  const rawreq = JSON.stringify(req.fields.rawRequest);
    console.log("\n\n\n raw req is = \n" + rawreq);
  
  const formID = req.fields.formID;
    console.log("formID is = \n" + formID);

  

  var parsed = JSON.parse(raw);
    console.log("parsed = \n" + parsed);

  var key = Object.keys(parsed);
    console.log("parsed key = \n" + key);

    console.log("keylength = " + key.length);

  for (var i=0 ; i < key.length ; i++) {
    var k = key[i]
      console.log((i+1) + ". " + k + " = " + parsed[k]);
  }
  
  

  //================= Extract data and send to Airtable ===============================
  

//==============================DECLARE+RESET VARIABLE==============================
var meetingID = parsed["q47_recordId"]; //result = "text"
//console.log("meetingID = " + meetingID);
var allAttendees = parsed["q45_input45"].trim();
//console.log("allAttendees = ");
//console.log(allAttendees);

var attachment = [];
for (var i=0 ; i<parsed["input162"].length ; i++) {
  attachment = attachment.concat(
    {
      "url": parsed["input162"][i]
    }
  );
};
//console.log("attachment = ");
//console.log(attachment);

var allAgendas = [];
allAgendas.push(parsed["q85_agenda1Name"].trim(),
parsed["q177_agenda2Name"].trim(),
parsed["q182_agenda3Name"].trim(),
parsed["q187_agenda4Name"].trim(),
parsed["q192_agenda5Name"].trim(),
parsed["q197_agenda6Name"].trim(),
parsed["q202_agenda7Name"].trim(),
parsed["q207_agenda8Name"].trim(),
parsed["q212_agenda9Name"].trim(),
parsed["q217_agenda10Name"].trim());
console.log("allAgendas = ");
console.log(allAgendas);
//result =
/*
allAgendas =
[
  'หัวข้อประชุมที่ 1',
  'หัวข้อประชุมที่ 2',
  'หัวข้อประชุมที่ 3',
  'หัวข้อประชุมที่ 4',
  'หัวข้อประชุมที่ 5',
  'หัวข้อประชุมที่ 6',
  'หัวข้อประชุมที่ 7',
  'หัวข้อประชุมที่ 8',
  'หัวข้อประชุมที่ 9',
  ''
]
*/
var agendaLayout = [];
var agendaID = [];

var JotNoteAndDecision = [
  parsed["q175_agenda1Note"],
  parsed["q178_agenda2Note"],
  parsed["q183_agenda3Note"],
  parsed["q188_agenda4Note"],
  parsed["q193_agenda5Note"],
  parsed["q198_agenda6Note"],
  parsed["q203_agenda7Note"],
  parsed["q208_agenda8Note"],
  parsed["q213_agenda9Note"],
  parsed["q218_agenda10Note"]
];
//check if JotNote[i] is not blank, so we can parse it to JSON format
for (var i=0 ; i<JotNoteAndDecision.length ; i++) {
  if(JotNoteAndDecision[i] != "") {
    JotNoteAndDecision[i] = JSON.parse(JotNoteAndDecision[i]);
  }
}
//console.log("JotNoteAndDecision = ");
//console.log(JotNoteAndDecision);
//result=
/*
[
  [
    {
      'ชนิดการบันทึก': 'การบันทึกทั่วไป (Note)',
      'ลำดับที่ (No.)': '1.1',
      'รายละเอียด': 'โน๊ต 1'
    },
    {
      'ชนิดการบันทึก': 'การบันทึกทั่วไป (Note)',
      'ลำดับที่ (No.)': '1.2',
      'รายละเอียด': 'โน๊ต 2'
    },
    {
      'ชนิดการบันทึก': 'การบันทึกทั่วไป (Note)',
      'ลำดับที่ (No.)': '1.3',
      'รายละเอียด': 'โน๊ต 3'
    },
    {
      'ชนิดการบันทึก': 'ข้อสรุป (Decision)',
      'ลำดับที่ (No.)': '1.4',
      'รายละเอียด': 'ข้อสรุป 1'
    },
    {
      'ชนิดการบันทึก': 'ข้อสรุป (Decision)',
      'ลำดับที่ (No.)': '1.5',
      'รายละเอียด': 'ข้อสรุป 2'
    }
  ],
  [
    {
      'ชนิดการบันทึก': 'การบันทึกทั่วไป (Note)',
      'ลำดับที่ (No.)': '2.1',
      'รายละเอียด': 'Note1'
    },
    {
      'ชนิดการบันทึก': 'ข้อสรุป (Decision)',
      'ลำดับที่ (No.)': '2.2',
      'รายละเอียด': 'สรุป\n' +
        ' - ทดสอบการใส่ข้อมูลมากกว่า 1 บรรทัด\n' +
        ' - ทดสอบว่าจะใส่ได้ยาวหรือเปล่า'
    },
    {
      'ชนิดการบันทึก': 'การบันทึกทั่วไป (Note)',
      'ลำดับที่ (No.)': '1.3',
      'รายละเอียด': 'ทดสอบการใส่ note กับข้อสรุปสลับกัน'
    }
  ],
  [
    {
      'ชนิดการบันทึก': 'ข้อสรุป (Decision)',
      'ลำดับที่ (No.)': '3.1',
      'รายละเอียด': 'xxxxxxx'
    },
    {
      'ชนิดการบันทึก': 'การบันทึกทั่วไป (Note)',
      'ลำดับที่ (No.)': '3.1',
      'รายละเอียด': 'Note 333333'
    },
    {
      'ชนิดการบันทึก': 'การบันทึกทั่วไป (Note)',
      'ลำดับที่ (No.)': '3.3',
      'รายละเอียด': 'ทดสอบการพิมพ์ข้อสรุป'
    }
  ],
  [
    {
      'ชนิดการบันทึก': 'ข้อสรุป (Decision)',
      'ลำดับที่ (No.)': '1',
      'รายละเอียด': 'ีีีีีีทดสอบทดสอบ 4'
    }
  ],
  '',
  [
    {
      'ชนิดการบันทึก': 'การบันทึกทั่วไป (Note)',
      'ลำดับที่ (No.)': '1',
      'รายละเอียด': 'โน๊ต 1'
    }
  ],
  [
    {
      'ชนิดการบันทึก': 'ข้อสรุป (Decision)',
      'ลำดับที่ (No.)': '1.5',
      'รายละเอียด': 'สรุป 777'
    }
  ],
  '',
  [
    {
      'ชนิดการบันทึก': 'การบันทึกทั่วไป (Note)',
      'ลำดับที่ (No.)': '1',
      'รายละเอียด': 'ทดสอบว่า agenda 8 ไม่มีข้อมูล มีแต่หัวข้อเฉยๆ '
    }
  ],
  ''
]
*/

//extract JotNote & JotDecision
var JotNote = [];
var JotDecision = [];
for(var i=0 ; i<JotNoteAndDecision.length ; i++) {

  if(JotNoteAndDecision[i] == "") {
    JotNote.push("");
    JotDecision.push("");
    //console.log("push empty record to JotNote & JotDecision");
  }
  else {
    let datachunk = JotNoteAndDecision[i];
    //console.log("datachunk = ");
    //console.log(datachunk);
    //console.log("datachunk.length = " + datachunk.length);
    let N = 0;
    let D = 0;
    let chunkN = [];
    let chunkD = [];

    for(var j=0 ; j<datachunk.length ; j++) {
      //console.log("datachunk"+(j+1)+" = ");
      //console.log(datachunk[j]);
      if(datachunk[j]["ชนิดการบันทึก"] == "การบันทึกทั่วไป (Note)") {
        chunkN.push(datachunk[j]);
        N=N+1;
        //console.log("added to chunkN ");
      }
      else {
        chunkD.push(datachunk[j]);
        D=D+1;
        //console.log("added to chunkD");
      }
    }
    if((N != 0) && (D != 0)) {
      JotNote.push(chunkN);
      JotDecision.push(chunkD);
    }
    if(N == 0) {
      JotNote.push("");
      JotDecision.push(chunkD);
    }
    if (D == 0) {
        JotDecision.push("");
        JotNote.push(chunkN)
    }
  }
//  console.log("JotNote = ");
//  console.log(JotNote);
//  console.log("JotDecision = ");
//  console.log(JotDecision);

}
// console.log(" \n\n JotNote = ");
// console.log(JotNote);
//result
/*
JotNote =
[
  [
    {
      'ชนิดการบันทึก': 'การบันทึกทั่วไป (Note)',
      'ลำดับที่ (No.)': '1.1',
      'รายละเอียด': 'โน๊ต 1'
    },
    {
      'ชนิดการบันทึก': 'การบันทึกทั่วไป (Note)',
      'ลำดับที่ (No.)': '1.2',
      'รายละเอียด': 'โน๊ต 2'
    },
    {
      'ชนิดการบันทึก': 'การบันทึกทั่วไป (Note)',
      'ลำดับที่ (No.)': '1.3',
      'รายละเอียด': 'โน๊ต 3'
    }
  ],
  [
    {
      'ชนิดการบันทึก': 'การบันทึกทั่วไป (Note)',
      'ลำดับที่ (No.)': '2.1',
      'รายละเอียด': 'Note1'
    },
    {
      'ชนิดการบันทึก': 'การบันทึกทั่วไป (Note)',
      'ลำดับที่ (No.)': '1.3',
      'รายละเอียด': 'ทดสอบการใส่ note กับข้อสรุปสลับกัน'
    }
  ],
  [
    {
      'ชนิดการบันทึก': 'การบันทึกทั่วไป (Note)',
      'ลำดับที่ (No.)': '3.1',
      'รายละเอียด': 'Note 333333'
    },
    {
      'ชนิดการบันทึก': 'การบันทึกทั่วไป (Note)',
      'ลำดับที่ (No.)': '3.3',
      'รายละเอียด': 'ทดสอบการพิมพ์ข้อสรุป'
    }
  ],
  '',
  '',
  [
    {
      'ชนิดการบันทึก': 'การบันทึกทั่วไป (Note)',
      'ลำดับที่ (No.)': '1',
      'รายละเอียด': 'โน๊ต 1'
    }
  ],
  '',
  '',
  [
    {
      'ชนิดการบันทึก': 'การบันทึกทั่วไป (Note)',
      'ลำดับที่ (No.)': '1',
      'รายละเอียด': 'ทดสอบว่า agenda 8 ไม่มีข้อมูล มีแต่หัวข้อเฉยๆ '
    }
  ],
  ''
]
*/
// console.log("\n\n JotDecision = ");
// console.log(JotDecision);
//result
/*
JotDecision =
[
  [
    {
      'ชนิดการบันทึก': 'ข้อสรุป (Decision)',
      'ลำดับที่ (No.)': '1.4',
      'รายละเอียด': 'ข้อสรุป 1'
    },
    {
      'ชนิดการบันทึก': 'ข้อสรุป (Decision)',
      'ลำดับที่ (No.)': '1.5',
      'รายละเอียด': 'ข้อสรุป 2'
    }
  ],
  [
    {
      'ชนิดการบันทึก': 'ข้อสรุป (Decision)',
      'ลำดับที่ (No.)': '2.2',
      'รายละเอียด': 'สรุป\n' +
        ' - ทดสอบการใส่ข้อมูลมากกว่า 1 บรรทัด\n' +
        ' - ทดสอบว่าจะใส่ได้ยาวหรือเปล่า'
    }
  ],
  [
    {
      'ชนิดการบันทึก': 'ข้อสรุป (Decision)',
      'ลำดับที่ (No.)': '3.1',
      'รายละเอียด': 'xxxxxxx'
    }
  ],
  [
    {
      'ชนิดการบันทึก': 'ข้อสรุป (Decision)',
      'ลำดับที่ (No.)': '1',
      'รายละเอียด': 'ีีีีีีทดสอบทดสอบ 4'
    }
  ],
  '',
  '',
  [
    {
      'ชนิดการบันทึก': 'ข้อสรุป (Decision)',
      'ลำดับที่ (No.)': '1.5',
      'รายละเอียด': 'สรุป 777'
    }
  ],
  '',
  '',
  ''
]
*/
var noteLayout = [];
var decisionLayout = [];

var JotTask = {};
JotTask["a1"] = JSON.parse(parsed["q86_agenda1Task"]);
JotTask["a2"] = JSON.parse(parsed["q179_agenda2Task"]);
JotTask["a3"] = JSON.parse(parsed["q184_agenda3Task"]);
JotTask["a4"] = JSON.parse(parsed["q189_agenda4Task"]);
JotTask["a5"] = JSON.parse(parsed["q194_agenda5Task"]);
JotTask["a6"] = JSON.parse(parsed["q199_agenda6Task"]);
JotTask["a7"] = JSON.parse(parsed["q204_agenda7Task"]);
JotTask["a8"] = JSON.parse(parsed["q209_agenda8Task"]);
JotTask["a9"] = JSON.parse(parsed["q214_agenda9Task"]);
JotTask["a10"] = JSON.parse(parsed["q219_agenda10Task"]);
var JotTaskKey = Object.keys(JotTask);
// console.log("\n\n JotTask = ");
// console.log(JotTask);
// console.log("\n\nJotTaskKey = " + JotTaskKey);
// console.log("JotTaskKey.length = " + JotTaskKey.length);
var taskLayout = [];

var JotResult = JSON.parse(parsed["q56_input56"]); //result = [{},{}]
console.log("JotResult = ");
console.log(JotResult);
var resultLayout = [];  //result = [{},{}]
var resultGroup = {}; //result = {[],[]}
var taskID = [];
var existTaskLayout = [];



//==============================DECLARE FUNCTION==============================
//put 'Agenda Name' into layout
function AgendaLayout(meetingID, allAgendas) {
  // console.log(meetingID);
  // console.log(allAgendas);

  return new Promise((resolve, reject) => {
    if(allAgendas) {
      let chunk = [];
      let resultGroup = {};
      console.log("allAgendas.length = " + allAgendas.length);
      //if there's a Notes, there's an agenda name!
      for (var i=0 ; i<allAgendas.length ; i++) {
        if (allAgendas[i] != "") {
          console.log("Agenda "+ (i+1) + " = " + allAgendas[i]);
            let layout = [
              {
                "fields": {
                  "Agenda Name": allAgendas[i],
                  "Meeting from Gcal": [
                    meetingID
                  ]
                }
              }
            ];
            chunk = chunk.concat(layout);
            agendaID = agendaID.concat("wait for a recordID from Airtable");
          }
          else {
            agendaID = agendaID.concat("");
          }

        }
      console.log("agendaID = ");
      console.log(agendaID);
      console.log("\n chunk = ");
      console.log(chunk);
      let j = 0;
      let k = 0;

      while (chunk.length - k > 0) {
        console.log("resultLayout-k =" + (chunk.length-k) );
        console.log("j = " + j);
        console.log("k = " + k);
        if (chunk.length - k > 10) {
          resultGroup[j] = chunk.slice(k, k+10);
          j = j+1;
          k = k+10;
        }
        else {
          resultGroup[j] = chunk.slice(k, chunk.length);
          k = chunk.length;
        }
      }
      console.log("resultGroup");
      console.log(resultGroup);
      resolve(resultGroup);
    }
    else {
      reject();
    }
  }).catch(err => {
    console.log(err);
  })

};


//put 'NOTE' into layout
function NoteLayout(JotNote, agendaID) {
  // console.log(JotNote);
  // console.log(allAgendas);

  return new Promise((resolve, reject) => {
    if(JotNote) {
      let chunk = [];
      let resultGroup = {};
      console.log("JotNote.length = " + JotNote.length);
      //if there's a Notes, there's an agenda name!
      for (var i=0 ; i<JotNote.length ; i++) {
        if (JotNote[i] != "") {
          console.log("JotNote agenda "+ (i+1) +".length = " + JotNote[i].length);
          for (var l=0 ; l<JotNote[i].length ; l++) {
            let layout = [
              {
                "fields": {
                  "Note Name": JotNote[i][l]["รายละเอียด"].trim(),
                  "No.": JotNote[i][l]["ลำดับที่ (No.)"].trim(),
                  "From Agenda": [agendaID[i]]
                }
              }
            ];
            //console.log(JSON.stringify(layout));
            chunk = chunk.concat(layout);
          }

        }


      }
      console.log("chunk");
      console.log(chunk);
      let j = 0;
      let k = 0;

      while (chunk.length - k > 0) {
        console.log("resultLayout-k =" + (chunk.length-k) );
        console.log("j = " + j);
        console.log("k = " + k);
        if (chunk.length - k > 10) {
          resultGroup[j] = chunk.slice(k, k+10);
          j = j+1;
          k = k+10;
        }
        else {
          resultGroup[j] = chunk.slice(k, chunk.length);
          k = chunk.length;
        }
      }
      console.log("resultGroup");
      console.log(resultGroup);
      resolve(resultGroup);
    }
    else {
      reject();
    }
  }).catch(err => {
    console.log(err);
  })

};


//put 'DECISION' into layout
function DecisionLayout(JotDecision, agendaID) {
  //console.log(JotDecision);
  //console.log(allAgendas);

  return new Promise((resolve, reject) => {
    if(JotDecision) {
      let chunk = [];
      let resultGroup = {};
      console.log("JotDecision.length = " + JotDecision.length);
      for (var i=0 ; i<JotDecision.length ; i++) {
        if (JotDecision[i] != "") {
          console.log("JotDecision agenda " + (i+1) + ".length = " + JotDecision[i].length);
          for (var l=0 ; l<JotDecision[i].length ; l++) {
            let layout = [
              {
                "fields": {
                  "Decision Name": JotDecision[i][l]["รายละเอียด"].trim(),
                  "No.": JotDecision[i][l]["ลำดับที่ (No.)"].trim(),
                  "From Agenda": [agendaID[i]]
                }
              }
            ];
            //console.log(JSON.stringify(layout));
            chunk = chunk.concat(layout);
          }

        }
      }
      console.log("chunk");
      console.log(chunk);
      let j = 0;
      let k = 0;

      while (chunk.length - k > 0) {
        console.log("resultLayout-k =" + (chunk.length-k) );
        console.log("j = " + j);
        console.log("k = " + k);
        if (chunk.length - k > 10) {
          resultGroup[j] = chunk.slice(k, k+10);
          j = j+1;
          k = k+10;
        }
        else {
          resultGroup[j] = chunk.slice(k, chunk.length);
          k = chunk.length;
        }
      }
      console.log("resultGroup");
      console.log(resultGroup);
      resolve(resultGroup);
    }
    else {
      reject();
    }
  }).catch(err => {
    console.log(err);
  })

};

//put 'NEW TASK' into layout
function TaskLayout(JotTask, agendaID) {
  //console.log(JotTask);
  //console.log(allAgendas);

  return new Promise((resolve, reject) => {
    if(JotTask) {
      let chunk = [];
      let resultGroup = {};
        console.log("JotTaskKey.length = " + JotTaskKey.length);
      for (var i=0 ; i<JotTaskKey.length ; i++) {
        let agenda = "a" + (i+1);
        if (JotTask[agenda][0]["งานที่ทำต่อ"] != "") {
          for (var m=0 ; m<JotTask[agenda].length ; m++) {
            let layout = [
              {
                "fields": {
                  "No.": JotTask[agenda][m]["ลำดับที่ (No.)"].trim(),
                  "Responsible Person": JotTask[agenda][m]["ผู้รับผิดชอบ"].trim(),
                  "Task": JotTask[agenda][m]["งานที่ทำต่อ"].trim(),
                  "Deadline": JotTask[agenda][m]["วันส่งงาน"],
                  "Status": "New",
                  "From Agenda": [agendaID[i]]
                }
              }
            ];
            //console.log(JSON.stringify(layout));
            chunk = chunk.concat(layout);
          }
        }
      }
      console.log("chunk");
      console.log(chunk);
      let j = 0;
      let k = 0;

      while (chunk.length - k > 0) {
        console.log("resultLayout-k =" + (chunk.length-k) );
        console.log("j = " + j);
        console.log("k = " + k);
        if (chunk.length - k > 10) {
          resultGroup[j] = chunk.slice(k, k+10);
          j = j+1;
          k = k+10;
        }
        else {
          resultGroup[j] = chunk.slice(k, chunk.length);
          k = chunk.length;
        }
      }
      console.log("resultGroup");
      console.log(resultGroup);
      resolve(resultGroup);
    }
    else {
      reject();
    }
  }).catch(err => {
    console.log(err);
  })

};

//put 'RESULT' into layout
function ResultLayout(JotResult) {

  //console.log("JotResult"+i +" = ");
  //console.log(JotResult[i]);
  //console.log("taskID"+i +" = " + taskID[i]);

  return new Promise((resolve, reject) => {
    if(JotResult) {
      let chunk = [];
      let resultGroup = {};
      console.log("JotResult.length = " + JotResult.length);
      for (var i=0 ; i<JotResult.length ; i++) {
        let completedDate = "";
        if (JotResult[i]["สถานะที่จะอัพเดท"] == "Completed") {
          completedDate = JotResult[i]["วันที่ทำเสร็จ (สำหรับสถานะ completed เท่านั้น)"];
        }
        console.log("completedDate of result " + (i+1) + " = " + completedDate);
        let layout = [
          {
            "fields": {
              "Result Name": JotResult[i]["รายละเอียดการอัพเดท"].toString().trim() ,
              "from Task": [
                JotResult[i]["ชื่อเรื่องติดตาม"].toString().trim()
              ],
              "Followed-up In Meeting": [
                meetingID.toString()
              ],
              "Task Status at Meeting Time": JotResult[i]["สถานะที่จะอัพเดท"].toString(),
              "Completed Date": completedDate
            }
          }
        ];
        //console.log(JSON.stringify(layout));
        chunk = chunk.concat(layout);

        // //floor i
        // let k = Math.floor(i/10);
        // console.log("k = " + k);
        // chunk[k] = concat(layout);
      }
      console.log("chunk");
      console.log(chunk);
      let j = 0;
      let k = 0;

      while (chunk.length - k > 0) {
        console.log("resultLayout-k =" + (chunk.length-k) );
        console.log("j = " + j);
        console.log("k = " + k);
        if (chunk.length - k > 10) {
          resultGroup[j] = chunk.slice(k, k+10);
          j = j+1;
          k = k+10;
        }
        else {
          resultGroup[j] = chunk.slice(k, chunk.length);
          k = chunk.length;
        }
      }
      console.log("resultGroup");
      console.log(resultGroup);
      resolve(resultGroup);
    }
    else {
      reject();
    }
  }).catch(err => {
    console.log(err);
  })

};

//put 'EXISTING TASK' into layout
function ExistTaskLayout(JotResult, taskID) {

  //console.log("JotResult"+i +" = ");
  //console.log(JotResult[i]);
  //console.log("taskID"+i +" = " + taskID[i]);

  return new Promise((resolve, reject) => {
    if(JotResult) {
      let chunk = [];
      let resultGroup = {};
      console.log("JotResult.length = " + JotResult.length);
      for (var i=0 ; i<JotResult.length ; i++) {
        let layout = [
          {
            "id": taskID[i],
            "fields": {
              "Status": JotResult[i]["สถานะที่จะอัพเดท"].trim()
            }
          }
        ];
        //console.log(JSON.stringify(layout));
        chunk = chunk.concat(layout);

        // //floor i
        // let k = Math.floor(i/10);
        // console.log("k = " + k);
        // chunk[k] = concat(layout);
      }
      console.log("chunk");
      console.log(chunk);
      let j = 0;
      let k = 0;

      while (chunk.length - k > 0) {
        console.log("resultLayout-k =" + (chunk.length-k) );
        console.log("j = " + j);
        console.log("k = " + k);
        if (chunk.length - k > 10) {
          resultGroup[j] = chunk.slice(k, k+10);
          j = j+1;
          k = k+10;
        }
        else {
          resultGroup[j] = chunk.slice(k, chunk.length);
          k = chunk.length;
        }
      }
      console.log("resultGroup");
      console.log(resultGroup);
      resolve(resultGroup);
    }
    else {
      reject();
    }
  }).catch(err => {
    console.log(err);
  })

};

//put 'MeetingName' into layout
function MeetingLayout(meetingID) {

  return new Promise((resolve, reject) => {

    if(meetingID) {

      //console.log("meetingID = " + meetingID);
      var activeAgendas = allAgendas;
      for (var i=0 ; i<activeAgendas.length ; i++) {
        //console.log("check activeAgendas loop" + (i+1));
        //console.log("activeAgendas = " + activeAgendas[i]);
        if (activeAgendas[i] == "") {
          // console.log("activeAgendas before splice = ");
          // console.log(activeAgendas);
          activeAgendas.splice(i,1);
          // console.log("activeAgendas after splice = ");
          // console.log(activeAgendas);
          i = i-1
        }
      }
      // console.log("activeAgendas =");
      // console.log(activeAgendas);
      let layout = [
        {
          "id": meetingID,
          "fields": {
            "Attendees in Meeting": allAttendees,
            "Attachment": attachment,
          }
        }
      ];

      resolve(layout);
    }
    else {
      reject();
    }
  }).catch(err => {
    console.log(err);
  })

};



//USE THIS FUNCTION WITH ALL RECORD SETS!!!!!
function RecordCreate(baseName, dataGroup) {
  //test OK!
  console.log("dataGroup = ");
  console.log(dataGroup);

  return new Promise((resolve, reject) => {
    if (dataGroup) {
      var allRecord = [];
      base(baseName).create(dataGroup , {typecast: true}, function(err, records) {
        if (err) {
          console.error(err);
          return;
        }
        records.forEach(function (record) {
          allRecord = allRecord.concat(record);
          console.log("record ID " + record.id + " from base " + baseName + " is CREATED!" );
        });
        console.log("allRecord = ");
        console.log(allRecord);
        resolve(allRecord);
      });
    }
    else {
      reject();
    }
  }).catch(err => {
    console.log(err);
  })
};

//USE THIS FUNCTION WITH ALL RECORD SETS!!!!!
function RecordUpdate(baseName, dataGroup) {
  //test OK!
  console.log("dataGroup = ");
  console.log(dataGroup);

  return new Promise((resolve, reject) => {
    let text = "";
    if (dataGroup) {

      base(baseName).update(dataGroup , {typecast: true}, function(err, records) {
        if (err) {
          console.error(err);
          return;
        }
        records.forEach(function(record) {
          text = "record ID " + record.id + " from base " + baseName + " is UPDATED!";
        });
        resolve(text);
      });
    }
    else {
      reject();
    }
  }).catch(err => {
    console.log(err);
  })
};

//USE THIS FUNCTION WITH ALL RECORD SETS!!!!!
function RetriveID(baseName, taskName ,meetingID) {

  return new Promise((resolve, reject) => {
    if(taskName) {
      //find an existing Task recordID from AIRTABLE_BASE_ID
      base(baseName).select({
        maxRecords: 1,
        fields: ["Next Action Name"],
        view: "Grid_Not_Complete_Task",
        filterByFormula: taskName.toString()
      }).all().then(records => {
        records.forEach((item) => {
          console.log(item);
          //    taskID = taskID.concat(item.id)
          //      console.log("taskID = " + taskID);
          resolve(item.id);
        })
      })
    }
    else {
      reject(console.log("can't find Task matching your searches"));
    }
  }).catch(err => {
    console.log(err);
  })

};

  
  

  //============================== RUN FUNCTIONS ==============================

  //---------------(WORKS!) CREATE 'AGENDA' RECORDS then retrive AGENDA IDs------------------------
  agendaLayout = agendaLayout.concat(await AgendaLayout(meetingID, allAgendas));
  console.log("agendaLayout = ");
  console.log(agendaLayout[0]);
  console.log("agendaLayout length = " + agendaLayout.length);

  let agendaRecord = [];
  for (var l = 0 ; l < agendaLayout.length ; l++) {
    agendaRecord = agendaRecord.concat(await RecordCreate("Meeting Agenda", agendaLayout[0][l]));
  }
  console.log("agendaRecord = ");
  console.log(agendaRecord);

  console.log("agendaRecord.length = " + agendaRecord.length);
  for (var i=0 ; i<agendaRecord.length ; i++) {
    let index = allAgendas.indexOf(agendaRecord[i]["fields"]["Agenda Name"]);
    agendaID[index] = agendaRecord[i]["id"];
  }
  console.log("agendaID = ");
  console.log(agendaID);


  //---------------(WORKS!) CREATE 'NOTE' RECORDS------------------------

  noteLayout = noteLayout.concat(await NoteLayout(JotNote, agendaID));
  console.log("noteLayout = ");
  console.log(noteLayout[0]);
  console.log("noteLayout length = " + noteLayout.length);

  for (var l = 0 ; l < noteLayout.length ; l++) {
    await RecordCreate("Note", noteLayout[0][l]);
  }


  //---------------(WORKS!) CREATE 'DECISION' RECORDS------------------------

  decisionLayout = decisionLayout.concat(await DecisionLayout(JotDecision, agendaID));
  console.log("decisionLayout = ");
  console.log(decisionLayout[0]);
  console.log("decisionLayout length = " + decisionLayout.length);

  for (var l = 0 ; l < decisionLayout.length ; l++) {
    await RecordCreate("Decision", decisionLayout[0][l]);
  }


  //---------------(WORKS!) CREATE 'TASK' RECORDS------------------------

  taskLayout = taskLayout.concat(await TaskLayout(JotTask, agendaID));
  console.log("taskLayout = ");
  console.log(taskLayout[0]);
  console.log("taskLayout length = " + taskLayout.length);

  for (var l = 0 ; l < taskLayout.length ; l++) {
    await RecordCreate("Task", taskLayout[0][l]);
  }



  //---------------(WORKS!) CREATE 'RESULT' RECORDS------------------------

  resultLayout = resultLayout.concat(await ResultLayout(JotResult));
  console.log("resultLayout = ");
  console.log(resultLayout[0]);
  console.log("resultLayout length = " + resultLayout.length);

  //create resultRecord
  for (var l = 0 ; l < resultLayout.length ; l++) {
    await RecordCreate("Result", resultLayout[0][l]);
  }



//---------------UPDATE 'EXISTING TASK' RECORDS------------------------

for (var i=0 ; i<JotResult.length ; i++ ) {

  var taskName = "{Next Action Name} = " + "'"+JotResult[i]["ชื่อเรื่องติดตาม"].trim()+"'";
  console.log("taskname = " + taskName);

  taskID = taskID.concat(await RetriveID("Task", taskName, meetingID));
  console.log("taskID = " + taskID);
}

existTaskLayout = existTaskLayout.concat(await ExistTaskLayout(JotResult, taskID));
console.log("existTaskLayout = ");
console.log(existTaskLayout[0]);
console.log("existTaskLayout length = " + existTaskLayout.length);

for (var l = 0 ; l < existTaskLayout.length ; l++) {
  var updateResult = await RecordUpdate("Task", existTaskLayout[0][l]);
  console.log(updateResult);
}


//---------------(WORKS!) UPDATE 'MEETING FRON GCAL' RECORD------------------------

var recordUpdateOutput = await RecordUpdate("Meeting from Gcal", await MeetingLayout(meetingID));
console.log(recordUpdateOutput);

  
  
res.send().end();
  
});




 
// listen for requests :)
app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + process.env.PORT);
});


