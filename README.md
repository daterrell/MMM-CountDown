# MMM-CountDown

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/) which can count down the days to a date/event, or up from a date/time

![Screenshot](.github/CountDown-1.png)

## Why?
Yes, there's another CountDown module, and again I didn't like the style/output, and wanted to have a few customizations that I didn't think fit with [the original](https://github.com/boazarad/MMM-CountDown) by [Boaz](https://github.com/boazarad)

## How?
### Manual install

1. Clone this repository in your `modules` folder:
  ```bash
  cd ~/MagicMirror/modules # adapt directory if you are using a different one
  git clone https://github.com/daterrell/MMM-CountDown.git
  ```
2. Add the module to your `config/config.js` file.
  ```js
  {
    module: 'MMM-CountDown',
    position: 'bottom_center',
    config: {
        // See configuration options
    }
  },
  ```

## Configuration options

| Option           | Description                                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| `position`       | *Required* Where do you want to place the counter (use standard magicmirror positions)                                |
| `event`          | *Required* Name of event to count down to (displayed above counter)                                                   |
| `date`           | *Required* Date to count down to (YYYY-MM-DD HH:MM:SS)                                                                |
