/**
 * Created by haams on 2017-08-17.
 */
var express = require("express");
var router = express.Router();
var MedForm = require("../../models/med_form/medFormDB");
var User = require("../../models/userDB");
var devReset = require("../dn_link/dev_reset"); // 시간에 맞게 디바이스 통제

/*
 투약 알림 설정
 */
function insertMedInfoData(LTID, medName, alarmHour, alarmHour2, alarmHour3, alarmMin, alarmMin2, alarmMin3, startDate, endDate, callback) {
    var medform = new MedForm({
        LTID: LTID,
        medname: medName,
        alarmHour: {
            hour1: alarmHour,
            hour2: alarmHour2,
            hour3: alarmHour3
        },
        alarmMin: {
            minute1: alarmMin,
            minute2: alarmMin2,
            minute3: alarmMin3
        },
        startDate: startDate,
        endDate: endDate
    });
    medform.save(function (err, medFormData) {
        if (err) return console.log('투약 알림 설정 저장 에러');
        else {
            console.log("투약 알림 설정 저장 성공");
            callback(err, medFormData);
        }
    })
}

function updateUserInfo(LTID, medName, startDate, endDate, alarm1, alarm2, alarm3, callback) {
    /*
     alarm 데이터만 삽입
     */
    var user = new User();
    user.updateUserInfoByAlarmData(LTID, medName, startDate, endDate, alarm1, alarm2, alarm3, function (err, alarmData) {
        if (err) return console.log("알림 데이터로 유저 정보 갱신 실패");
        else {
            console.log("알림 데이터로 유저 정보 갱신 성공 ");
            callback(err, alarmData);
        }
    });
}

function toSendDevResetByAlarmTime(LTID, startDate, endDate, alarm1, alarm2, alarm3) {
    console.log(LTID + " 입니다.");
    /*
     알람 날짜 & 알람 시간에 따라 리셋 내리기 --> devReset을 extmgmtcmd로 변경하는 법 체크해야하고 이를 받아서 디바이스에서
     진동센서로 신호를 보내는 것을 해야함 (String Tokenizer)
     */
    // startDate 에서 T를 기준으로 앞에 부분만 뽑기 , endDate도 마찬가지로 T를 기준으로 앞에 부분만 뽑기
    // 처음 시작한 날 부터 끝나는 날 까지 해서 그거 Date에서 뽑기
    var srtArr = new Array();
    var endArr = new Array();
    var DateForm = new Array();
    console.log(startDate);
    console.log(new Date(Date.parse(startDate)).getDate() + "변환중");
    // srtArr = startDate.split("T"); // 시작 날짜 T로 구분 예:) 2017-10-09

    // endArr = endDate.split("T");   // 종료 날짜 T로 구분 예:) 2017-10-20

    var rMonth = new Date(Date.parse(startDate)).getMonth();
    var lMonth = new Date(Date.parse(endDate)).getMonth();
    var sDate = new Date(new Date(Date.parse(startDate)).getFullYear() + "-" + (rMonth + 2) + "-" + new Date(Date.parse(startDate)).getDate());
    var eDate = new Date(new Date(Date.parse(endDate)).getFullYear() + "-" + (lMonth + 2) + "-" + new Date(Date.parse(endDate)).getDate());
    console.log(sDate.getFullYear() + " // " + sDate.getMonth() + " // " + sDate.getDate());
    console.log(eDate.getFullYear() + "//" + eDate.getMonth() + "//" + eDate.getDate());
    var today = new Date(sDate.getYear() + "-" + sDate.getMonth() + "-" + sDate.getDate());
    // 시작 날짜를 기준으로 오늘 날짜를 만들었음 .. ! 보통은 시작 날짜가 투약 알림 시작과 동일하기 때문
    var dateMonth = undefined;
    var dateDay = undefined;
    if (sDate.getYear() > today.getYear() && sDate.getMonth() > today.getMonth()
        && sDate.getDate() > today.getDate()) {
        return new Error("시작 날짜 설정이 잘못되었습니다.");
    } else {
	console.log("여기 되는 중..?");
        dateMonth = today.getMonth() + 1; // 계산할 월 수
        dateDay = today.getDate();    // 계산할 일 수
        // 시작 날짜 부터 해서 날짜 카운팅
        // 종료 날짜 이 전까지 Date만들기.
        do {
            if ((today.getMonth() + 1) == 4 || (today.getMonth() + 1) == 6 ||
                (today.getMonth() + 1) == 9 || (today.getMonth() + 1) == 11) {

                if ((sDate.getMonth() == dateMonth || eDate.getMonth() == dateMonth)) {
                    // 약먹는 날이 시작 날인 달 or 끝나는 날의 달이어야 함.
                    if (dateDay >= sDate.getDate() && dateDay <= eDate.getDate()) {
                        var chkDate = new Date();
                        var timer1_h = chkDate.getHours() * 360000;
                        var timer1_m = chkDate.getMinutes() * 60000;
                        var timer1_hm = (alarm1.split(":")[0] * 360000 + alarm1.split(":")[1] * 60000) - (timer1_h + timer1_m);
                        console.log(timer1_hm + "이 후에 알림이 울립니다."); // 첫 투약 알람
                        setTimeout(function () {
                            console.log("다운링크 1 차 ");
			    console.log(LTID);
                            devReset(LTID);
                        }, timer1_hm);

                        var timer2_hm = (alarm2.split(":")[0] * 360000 + alarm2.split(":")[1] * 60000) - (timer1_h + timer1_m);
                        console.log(timer2_hm + "이 후에 알림이 울립니다."); // 두 번째 투약 알람
                        setTimeout(function () {
                            console.log("다운링킄  2차 ");
                            devReset(LTID);
                        }, timer2_hm);

                        var timer3_hm = (alarm3.split(":")[0] * 360000 + alarm3.split(":")[1] * 60000) - (timer1_h + timer1_m);
			console.log(timer3_hm + "이 후에 알림이 울립니다."); // 세 번째 투약 알람
                        setTimeout(function () {
                            console.log("다운링크 3차");
                            dateDay += 1; // 다운링크 3차 (하루의 마지막 알림)
                            devReset(LTID);
                        }, timer3_hm);
                    }else{
                        break; // 일 수가 오버될 경우 break >> 반복문 아웃
                    }
                }

                if (dateDay > 30) {
                    dateMonth += 1; // 30일이 지나면 한 달 증가
                    dateDay = 1; // 달이 바뀌면 일 수는 1로
                } else {
                    dateDay++;
                }

            }
            else if ((today.getMonth() + 1) == 1 || (today.getMonth() + 1) == 3 ||
                (today.getMonth() + 1) == 5 || (today.getMonth() + 1) == 7 || (today.getMonth() + 1) == 8
                || (today.getMonth() + 1) == 10 || (today.getMonth() + 1) == 12) {
                // 31일 까지 있는 달

                if ((sDate.getMonth() == dateMonth || eDate.getMonth() == dateMonth)) {
                    if (dateDay >= sDate.getDate() && dateDay <= eDate.getDate()) {
                        var chkDate = new Date();
                        var timer1_h = chkDate.getHours() * 360000;
                        var timer1_m = chkDate.getMinutes() * 60000;
                        var timer1_hm = (alarm1.split(":")[0] * 360000 + alarm1.split(":")[1] * 60000) - (timer1_h + timer1_m);
			console.log(timer1_hm + " 이 후에 알림이 울립니다.");
                        setTimeout(function () {
                            console.log("다운링크 1 차 ");
                            devReset(LTID);
                        }, timer1_hm);

                        var timer2_hm = (alarm2.split(":")[0] * 360000 + alarm2.split(":")[1] * 60000) - (timer1_h + timer1_m);
                        console.log(timer2_hm + "이 후에 알림이 울립니다.");
                        setTimeout(function () {
                            console.log("다운링크  2차 ");
                            devReset(LTID);
                        }, timer2_hm);

                        var timer3_hm = (alarm3.split(":")[0] * 360000 + alarm3.split(":")[1] * 60000) - (timer1_h + timer1_m);
			console.log(timer3_hm + "이 후에 알림이 울립니다.");
                        setTimeout(function () {
                            console.log("다운링크 3차");
                            dateDay += 1; // 하루의 마지막 다운링크만 하루 일 수를 증가하면 된다.
                            devReset(LTID);
                        }, timer3_hm);
                    }else{
                        break; // 일 수가 오버될 경우 break;
                    }
                }


                if (dateDay >= 31) {
                    dateMonth += 1;
                    dateDay = 1; // 한 달이 지나고 일 수는 1로 회귀한다.
                } else { // 31일이 넘지 않을 때 날짜 수는 증가 한다.
                    dateDay++;
                }
            } else {
                // 2월
            }
        }
        while (today.getFullYear() <= eDate.getFullYear() && dateMonth <= eDate.getMonth() && dateDay <= eDate.getDate());
// 반복문 종료 후 반복문 벗겨지면서 devReset 진행 --> LTID
    }
}


router.post("/insert", function (req, res, next) {
    var medName = req.body.medName;
    var LTID = req.body.LTID;
    // LTID를 같이 보낼 것 -- 이걸 가지고 다른 정보들 업데이트 할 것이기 때문 (안드로이드에서 작업할 부분) - sharedPreference
    // client - medName
    var alarmHour = req.body.alarmHour[0];
    var alarmHour2 = req.body.alarmHour[1];
    var alarmHour3 = req.body.alarmHour[2];

    var alarmMin = req.body.alarmMin[0];
    var alarmMin2 = req.body.alarmMin[1];
    var alarmMin3 = req.body.alarmMin[2];


    var alarm1 = alarmHour + ":" + alarmMin;
    var alarm2 = alarmHour2 + ":" + alarmMin2;
    var alarm3 = alarmHour3 + ":" + alarmMin3;

    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    console.log(medName);
    console.log("약이름:" + medName + "/시" + alarmHour + "/" + alarmHour2 + "/" + alarmMin + "/" + alarmMin2 +
        "/" + startDate + "/" + endDate);

    insertMedInfoData(LTID, medName, alarmHour, alarmHour2, alarmHour3, alarmMin, alarmMin2, alarmMin3, startDate, endDate, function (err, medForm) {
        if (err) return console.log("투약 알림 정보 데이터 저장 실패");
        else {
            updateUserInfo(LTID, medName, startDate, endDate, alarm1, alarm2, alarm3, function (err, alarmData) {
                if (err) return console.log('투약 알람 시간 정보 저장 실패');
                else {
                    console.log("투약 알림 저장한 거 유저에 접목이 되었음");
                }
            });
            console.log("투약 알림 정보 데이터 저장은 성공 하였음");
            toSendDevResetByAlarmTime(LTID, startDate, endDate, alarm1, alarm2, alarm3);
            return res.status(200).send(JSON.stringify(medForm));
        }
    });


    /*
     medName,startDate,endDate,alarmTime{alarm1,alarm2,alarm3} --> userDB에 업데이트 하도록
     남은 부분은 lat,lon,pulse 인데 이 부분은 Lora - upLink 작업
     */
    /*
     updateUserInfo(LTID,medName,startDate,endDate,alarm1,alarm2,alarm3,function(err,alarmData){
     if(err) return console.log("투약 알림 시간 정보 저장 실패 ");
     else{
     console.log('투약 알림 저장한 거 유저에 접목 되었음');
     return res.status(200).json(alarmData);
     }
     });
     */
});

module.exports = router;
