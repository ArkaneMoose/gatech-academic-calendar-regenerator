# GT Academic Calendar Regenerator

[Add to Google Calendar](https://calendar.google.com/calendar/r?cid=es7amkphtm3notec11vi5ae5k7p81mpb%40import.calendar.google.com)  
[Download a snapshot of the current calendar in .ics format](https://gatech-academic-calendar-regenerator.netlify.app/calendar.ics)

To subscribe to this calendar in another calendar client, find an option to add a calendar by URL, and try one of these URLs:
```
https://gatech-academic-calendar-regenerator.netlify.app/calendar.ics
webcal://gatech-academic-calendar-regenerator.netlify.app/calendar.ics
```

## Why?

A couple reasons:

- First, Georgia Tech seemed to stop updating [their own webcal feed](webcal://communication.registrar.gatech.edu/feeds/ical/current/gt-academic-calendar-subscription.ics) back in July, so it&rsquo;s missing up-to-date information on the modified Spring 2021 calendar.
- Second, I was sick of seeing 47-day-long events like &ldquo;Online Application for Graduation&rdquo; taking up space on my Google Calendar every day.

## How?

This uses a [serverless function on Netlify](https://docs.netlify.com/functions/overview/) that pulls the [XML file](https://registrar.gatech.edu/academiccalendar/current/data.xml) used as the data source for the [registrar&rsquo;s calendar webpage](https://registrar.gatech.edu/calendar) and generates an iCal file based on that.

Events longer than three days are broken up into two single-day events, &ldquo;First Day of &lt;Event&gt;&rdquo; and &ldquo;Last Day of &lt;Event&gt;&rdquo;.

## How to run locally?

You need [Node.js](https://nodejs.org/), probably Node.js 12 or higher.

Using [Yarn](https://classic.yarnpkg.com/) (my preferred package manager):
```bash
yarn
yarn dev
```

Using npm (included with Node.js):
```bash
npm install
npm run dev
```
