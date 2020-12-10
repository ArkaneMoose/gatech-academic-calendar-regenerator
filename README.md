# GT Academic Calendar Regenerator

[Add to your calendar](webcal://gatech-academic-calendar-regenerator.netlify.app/calendar.ics)  
[Download .ics file](https://gatech-academic-calendar-regenerator.netlify.app/calendar.ics)

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
