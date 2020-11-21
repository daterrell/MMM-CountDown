Module.register("MMM-CountDown", {
    defaults: {
        event: "Millenium:",
        date: "3000-01-01",
        daysLabel: "days ",
        allowNegative: false,
        toTime: false // Whether the countdown is to a specific time
    },

    updateFreq: "CLOCK_MINUTE",

    templateData: {
        event: null,
        time: null,
        label: null
    },

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
        return this.templateData;
    },

    // set update interval
    start: function () {
        console.log("Starting up " + this.name);
        this.updateData();
        this.updateDom();
    },

    notificationReceived: function (notification) {
        if (notification === this.updateFreq) {
            this.updateData();
            this.updateDom();
        }
    },

    updateData: function () {
        var target = moment(this.config.date).add(1, "day");
        var now = moment();
        var timeDiff = target.diff(now);
        var diffDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        if (Math.abs(diffDays) > 1) {
            this.updateTemplateData(Math.abs(diffDays), this.config.daysLabel);

            if (diffDays <= -1 && !this.config.allowNegative) {
                this.hide();
                return null;
            }
        } else if (diffDays < 0 && diffHours < 24 && !this.config.toTime) {
            this.updateTemplateData("TODAY!", null);
        } else {
            this.updateFreq = "CLOCK_SECOND";
            var diffHours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var diffMinutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            var diffSeconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            this.updateTemplateData(`T-${this.pad(diffHours, 2)}:${this.pad(diffMinutes, 2)}:${this.pad(diffSeconds, 2)}`, null);
        }
    },

    updateTemplateData(date, label) {
        this.templateData.date = date;
        this.templateData.label = label;
        this.templateData.event = this.config.event;
        return this.templateData;
    },

    pad: function pad(num, size) {
        num = num.toString();
        while (num.length < size) num = "0" + num;
        return num;
    }
});
