class TimeDiff {
    static millisPerSecond = 1000;
    static millisPerMinute = TimeDiff.millisPerSecond * 60;
    static millisPerHour = TimeDiff.millisPerMinute * 60;
    static millisPerDay = TimeDiff.millisPerHour * 24;

    diffDays;
    diffHours;
    diffMinutes;
    diffSeconds;

    relHours;
    relMinutes;
    relSeconds;

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

        this.relHours = Math.floor((timeDiff % TimeDiff.millisPerDay) / TimeDiff.millisPerHour);
        this.relMinutes = Math.floor((timeDiff % TimeDiff.millisPerHour) / TimeDiff.millisPerMinute);
        this.relSeconds = Math.floor((timeDiff % TimeDiff.millisPerMinute) / TimeDiff.millisPerSecond);

        this.isPast = this.target.isBefore(now);
    }
}

class TemplateData {
    timeDiff;
    isToTime;

    event;
    date;
    label;
    daysLabel;
    hidden;

    constructor(event, timeDiff, isToTime, daysLabel) {
        this.event = event;
        this.timeDiff = timeDiff;
        this.isToTime = isToTime;
        this.daysLabel = this.label = daysLabel;
    }

    update() {
        this.timeDiff.update();
        this.updateData();
    }

    updateData() {
        if (this.timeDiff.diffHours < 24 && !this.timeDiff.isPast) {
            this.date = `T-${this.pad(this.timeDiff.relHours, 2)}:${this.pad(this.timeDiff.relMinutes, 2)}:${this.pad(this.timeDiff.relSeconds, 2)}`;
            this.label = null;
        } else if (this.timeDiff.diffDays >= 1) {
            if (!this.timeDiff.isPast)
                this.date = this.timeDiff.diffDays + 1;
            else
                this.date = this.timeDiff.diffDays;
        } else {
            this.date = "TODAY!";
            this.label = null;
        }
    }

    pad(num, size) {
        num = num.toString();
        while (num.length < size) num = "0" + num;
        return num;
    }

    hide(value) {
        this.hidden = value;
    }
}

Module.register("MMM-CountDown", {
    defaults: {
        event: "Millenium:",
        date: "3000-01-01",
        daysLabel: "days ",
        allowNegative: false,
        toTime: false, // Whether the countdown is to a specific time
        isAnnual: false, // e.g. a birthday
        annualDaysDiff: 60,
    },

    templateData: null,

    timeDiff: null,

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

    start: function () {
        console.log("Starting up " + this.name);
        var updatedDate = this.getUpdatedDate();

        this.timeDiff = new TimeDiff(updatedDate);
        this.templateData = new TemplateData(this.config.event, this.timeDiff, this.config.toTime, this.config.daysLabel);
        this.update();
    },

    notificationReceived: function (notification) {
        if (notification === "CLOCK_SECOND") {
            this.update();
        }
    },

    update: function () {
        this.templateData.hide(this.shouldHide());
        this.updateDom();
    },

    shouldHide: function () {
        return this.shouldNotShowYet() ||
            this.isPastEvent() || 
            this.isPastToTimeEvent();
    },

    shouldNotShowYet: function () {
        return this.config.isAnnual &&
            this.timeDiff.diffDays > this.config.annualDaysDiff;
    },

    isPastEvent: function () {
        return this.config.allowNegative === false &&
            this.timeDiff.diffHours >= 24 &&
            this.timeDiff.isPast;
    },

    isPastToTimeEvent: function () {
        return this.timeDiff.diffHours >= 24 &&
            this.config.isToTime;
    },

    getUpdatedDate() {
        if (!this.config.isAnnual) return this.config.date;
        return new moment(this.config.date).year(new moment().year()).format('YYYY-MM-DD');
    },

    disable: function () {
        this.notificationReceived = function () { };
        this.getTemplate = function () { };
        this.hide();
    }
});
