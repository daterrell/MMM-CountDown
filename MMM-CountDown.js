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
    isFuture;

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
        this.isFuture = this.target.isAfter(now);
    }
}

class TemplateData {
    timeDiff;
    isToTime;

    event;
    date;
    label;
    daysLabel;
    config;

    hidden = false;

    constructor(event, timeDiff, isToTime, daysLabel, config) {
        this.event = event;
        this.timeDiff = timeDiff;
        this.isToTime = isToTime;
        this.daysLabel = this.label = daysLabel;
        this.config = config;
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
        } else if (this.config.isReminder) {
            this.date = this.config.event;
            this.label = null;
            this.event = "!";
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
        isMonthly: false,
        dayOfMonth: "01",
        isReminder: false
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
        this.templateData = new TemplateData(this.config.event, this.timeDiff, this.config.toTime, this.config.daysLabel, this.config);
        this.update();

        const updateTimer = () => {
            this.update();

            var delay = 100;

            if (this.templateData.hidden || this.timeDiff.diffHours > 24) {
                delay = 60000 - moment().milliseconds() + 50;
            } else {
                delay = 1000 - moment().milliseconds() + 50;
            }

            setTimeout(updateTimer, delay);
        };

        setTimeout(updateTimer, 250);
    },

    update: function () {
        this.templateData.hide(this.shouldHide());
        this.updateDom();
    },

    shouldHide: function () {
        if(this.config.isMonthly) {
            return false;
        }
        if (this.config.isReminder) {
            return this.timeDiff.isFuture ||
                    this.isPastEvent();
        }
        return this.shouldNotShowYet() ||
                this.isPastEvent() ||
                this.isPastToTimeEvent();
    },

    isItToday: function () {
        return this.config.isReminder && !this.timeDiff.isFuture;
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

    getNextMonthlyDate: function () {
        toDay = moment().date();
        month = moment().month();
        year = moment().year();
        if(toDay > this.config.dayOfMonth){
            month = month+1;
        }
        if (month == 12) {
            month = 0
            year = year+1;
        }
        target = new moment().year(year).month(month).date(this.config.dayOfMonth);
        if (target.isoWeekday() === 6 || target.isoWeekday() === 7) {
            target = target.isoWeekday(5);
        }
        return target.format('YYYY-MM-DD');
    },

    getUpdatedDate() {
        if (this.config.isMonthly) return this.getNextMonthlyDate();
        if (!this.config.isAnnual) return this.config.date;

        var date = new moment(this.config.date).year(new moment().year());
        var now = new moment();
        var hourDiff = moment.duration(now.diff(date)).asHours();

        if (date.isBefore(now) && hourDiff > 24)
            date = date.add(1, 'y');

        return date.format('YYYY-MM-DD');
    },

    disable: function () {
        this.notificationReceived = function () { };
        this.getTemplate = function () { };
        this.hide();
    }
});
