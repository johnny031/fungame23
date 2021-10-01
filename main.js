let current_topic = 0
let locked = false
let answer
let red_turn = false
let slider_width = $(window).width() < 610 ? $(window).width() / 2 - 5 : 300
let turn
let message
let surprise = false

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}
// range = 25
// min:-10,15 , mid: 0,25 ,max: 85,110
// 15, 25
// -104.5, -86
function rotate() {
    $("#rotate, #reveal").attr("disabled", true)
    answer = Math.floor(Math.random() * (110 - 15 + 1)) + 15
    let sliderVal = (answer - 25).toString() + "," + answer.toString()
    $("#range").roundSlider("setValue", sliderVal)
    if (answer < 25) {
        let deg = -104.5 + 18.5 * (answer - 15) / 10
        $("body").get(0).style.setProperty("--deg", `${deg}deg`)
    } else {
        $("body").get(0).style.setProperty("--deg", "-86deg")
    }
    $("#spinner").animateRotate(1080, {
        duration: 2500,
        easing: "swing",
        complete: function () {
            $(".hint").html(message[1])
            $("#rotate, #reveal").attr("disabled", false)
        }
    });
}

$.fn.animateRotate = function (angle, duration, easing, complete) {
    var args = $.speed(duration, easing, complete);
    var step = args.step;
    return this.each(function (i, e) {
        args.complete = $.proxy(args.complete, e);
        args.step = function (now) {
            $.style(e, 'transform', 'translate(-50%, -50%) rotate(' + now + 'deg)');
            if (step) return step.apply(e, arguments);
        };
        $({ deg: 0 }).animate({ deg: angle }, args);
    });
};

function change_topic() {
    $(".topic1").html(topic[current_topic][0])
    $(".topic2").html(topic[current_topic][1])
    current_topic++
}

function reset() {
    red_turn = !red_turn
    change_topic()
    $("#spinner").fadeToggle()
    $(".round-div").css("color", red_turn ? "#b40101" : "#001ba4")
    $("body").get(0).style.setProperty("--color", red_turn ? "#001ba4" : "#b40101")
    $("body").get(0).style.setProperty("--bg-color", red_turn ? "#f5e2e2" : "#e0e6f3")
    $("#slider").roundSlider("setValue", "0")
    $("#confirm").html("確定")
    $('input[name="radio"]').prop("checked", false)
    $("#confirm").attr("disabled", true)
    $("#rotate").attr("disabled", false)
    turn = red_turn ? ["紅隊", "藍隊"] : ["藍隊", "紅隊"]
    message = [`請${turn[0]}出題者按「轉」來轉轉盤`, `請${turn[0]}出題者<br/>1. 按「開」檢視結果<br/>2. 按「關」闔上擋板`, `1. 請${turn[0]}出題者出題目<br/>2. 請${turn[0]}隊員移動指針<br/>3. 請${turn[1]}隊員選擇左右<br/>4. 按確定`]
    $(".hint").html(message[0])
    $(".round").html(turn[0])
}

$("#slider").roundSlider({
    sliderType: "min-range",
    radius: slider_width,
    showTooltip: false,
    width: slider_width,
    value: 0,
    handleSize: "170,30",
    handleShape: "square",
    circleShape: "half-top",
    readOnly: true
})

$("#range").roundSlider({
    sliderType: "range",
    radius: slider_width,
    showTooltip: false,
    width: slider_width,
    handleSize: 0,
    circleShape: "half-top",
    animation: false,
    readOnly: true
})

// Initialize
shuffle(topic)
reset()
$("body").get(0).style.setProperty("--handle-length", `${slider_width * 0.687}px`)

$(window).resize(function () {
    slider_width = $(window).width() < 610 ? $(window).width() / 2 - 5 : 300
    $("#slider, #range").roundSlider({
        radius: slider_width,
        width: slider_width
    })
    $("body").get(0).style.setProperty("--handle-length", `${slider_width * 0.687}px`)
})

$("#reveal").on("click", function () {
    if (surprise) {
        happyBirthday()
        return false
    }
    $(this).attr("disabled", true)
    $("#rotate").attr("disabled", true)
    if (locked) {
        $(this).html("開")
        $("#confirm").attr("disabled", false)
        $(".hint").html(message[2])
        $("#slider").roundSlider("option", "readOnly", false)
    } else {
        setTimeout(() => {
            $(this).attr("disabled", false)
            $(this).html("關")
        }, 500)
    }
    $("#spinner").fadeToggle()
    locked = !locked
})

$("#confirm").on("click", function () {
    if ($(this).html() === "下一局") {
        reset()
        return false
    }
    if (!$("input[name=radio]:checked").val()) {
        alert(`請${turn[1]}選擇左右`)
        return false
    }
    $("#slider").roundSlider("option", "readOnly", true)

    let val = $("#slider").roundSlider("getValue")
    let is_left = $("input[name=radio]:checked").val() === "left"
    let round = red_turn ? ["red", "yellow"] : ["yellow", "red"]
    let score0 = 0
    let score1 = 0

    if (val >= answer - 15 && val <= answer - 10) {
        score0 = 4
    } else if ((val >= answer - 20 && val < answer - 15) || (val > answer - 10 && val <= answer - 5)) {
        score0 = 3
    } else if ((val >= answer - 25 && val < answer - 20) || (val > answer - 5 && val <= answer)) {
        score0 = 2
    }

    if ((is_left && val > answer - 10) || (!is_left && val < answer - 15)) {
        score1 = 1
    }
    let team0_sum = parseInt($(`.${round[0]}`).html()) + score0
    let team1_sum = parseInt($(`.${round[1]}`).html()) + score1

    $(`.${round[0]}`).html(team0_sum)
    $(`.${round[1]}`).html(team1_sum)
    $(".hint").html(`${turn[0]}得 ${score0} 分，${turn[1]}得 ${score1} 分`)
    if (score0 === 4 && team0_sum < team1_sum) {
        // score 4 points and still behind
        red_turn = !red_turn
        $(".hint").append(`<br/>${turn[0]}可再出題一回合!!!`)
    }

    $("#spinner").fadeToggle()
    $(this).html("下一局")
})

$(".flex-btw").on("click", function () {
    $(".hint").slideToggle()
})

$(".surprise").on("dblclick", function () {
    $(this).animate({
        opacity: 1,
    }, 500)
    $(this).animate({
        opacity: 0,
    }, 500)
    surprise = true
})

function happyBirthday() {
    $(".main-container").hide()
    $("body").css("background-color", "black")
    $("#surpriseVideo").show()
    $("#surpriseVideo").get(0).play()
    setTimeout(() => {
        $("#surpriseImg").fadeIn()
        setTimeout(() => {
            $("#surpriseText1").animate({ marginLeft: "-=30%" })
            $("#surpriseText1").fadeIn()
            $("#surpriseText1").animate({ marginLeft: "+=30%" }, 600)

            $("#surpriseImg").animate({ width: "+=60vw", height: "+=40vh" }, 1400)

            setTimeout(() => {
                $("#surpriseText2").animate({ fontSize: "+=2rem" })
                $("#surpriseText2").fadeIn()
                $("#surpriseText2").animate({ fontSize: "-=2rem" }, 800)

                $("#surpriseText2").animate({ fontSize: "+=1rem" }, 140)
                $("#surpriseText2").animate({ fontSize: "-=1rem" }, 140)
                $("#surpriseText2").animate({ fontSize: "+=1rem" }, 140)
                $("#surpriseText2").animate({ fontSize: "-=1rem" }, 140)
                $("#surpriseText2").animate({ fontSize: "+=1rem" }, 140)
                $("#surpriseText2").animate({ fontSize: "-=1rem" }, 140)

                $("#surpriseImg").animate({ width: "-=60vw", height: "-=40vh" }, 1400)
            }, 1400)
        }, 500)
    }, 3000)
}