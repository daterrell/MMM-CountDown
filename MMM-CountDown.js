class TimeDiff {
    static millisPerSecond = 1000;
    static millisPerMinute = TimeDiff.millisPerSecond * 60;
    static millisPerHour = TimeDiff.millisPerMinute * 60;
    static millisPerDay = TimeDiff.millisPerHour * 24;

    diffDays;
    diffHours;
    diffMinutes;
    diffSeconds;
    isPast;

    constructor(date) {
        this.target = moment(date);
        this.update();
    }

    update() {
        let now = moment();
        let timeDiff = Math.abs(this.target.diff(now));

        this.diffDays = Math.floor(timeDiff / TimeDiff.millisPerDay);
        this.diffHours = Math.floor(timeDiff / TimeDiff.millisPerHour);
        this.diffMinutes = Math.floor(timeDiff / TimeDiff.millisPerMinute);
        this.diffSeconds = Math.floor(timeDiff / TimeDiff.millisPerSecond);
        this.isPast = this.target.isBefore(now);
    }
}

class TemplateData {
    timeDiff;
    isToTime;

    event;
    date;
    label;

    constructor(event, timeDiff, isToTime) {
        this.event = event;
        this.timeDiff = timeDiff;
        this.isToTime = isToTime;
    }

    update() {
        this.timeDiff.update();
        this.updateData();
    }

    updateData() {
        if (this.timeDiff.diffDays >= 1) {
            this.date = this.timeDiff.diffDays;
            if (!this.timeDiff.isPast) this.diffDays += 1;
        } else if (this.timeDiff.diffDays === 0 &&
            this.isToTime === false) {
            this.date = "TODAY!";
            this.label = null;
        } else {
            this.date = `T-${this.pad(timeDiff.diffHours, 2)}:${this.pad(timeDiff.diffMinutes, 2)}:${this.pad(timeDiff.diffSeconds, 2)}`;
            this.label = null;
        }
    }

    pad(num, size) {
        num = num.toString();
        while (num.length < size) num = "0" + num;
        return num;
    }
}

Module.register("MMM-CountDown", {
    defaults: {
        event: "Millenium:",
        date: "3000-01-01",
        daysLabel: "days ",
        allowNegative: false,
        toTime: false // Whether the countdown is to a specific time
    },

    templateData: null,

    timeDiff: null,

    getHeader: function () {
        return false;
    },

    getScripts: function () {
        return ["moment.js", "moment-timezone.js"];
    },

    getStyles: function () {
        return ["MMM-CountDown.css"];
    },

    getTemplate: function () {
        return "MMM-CountDown.njk"
    },

    getTemplateData: function () {
        this.templateData.update();
        return this.templateData;
    },

    // set update interval
    start: function () {
        console.log("Starting up " + this.name);
        this.timeDiff = new TimeDiff(this.config.date);
        this.templateData = new TemplateData(this.config.event, this.timeDiff, this.config.toTime);
        this.update();
    },

    notificationReceived: function (notification) {
        if (notification === "CLOCK_SECOND") {
            this.update();
        }
    },

    update: function () {
        if (this.shouldHide()) this.disable();
        else this.updateDom();
    },

    shouldHide: function () {
        return this.config.allowNegative === false &&
            this.timeDiff.isPast &&
            this.timeDiff.diffHours >= 24;
    },

    disable: function () {
        this.notificationReceived = function () { };
        this.hide();
    }
});
