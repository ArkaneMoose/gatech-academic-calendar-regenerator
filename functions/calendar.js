const axios = require('axios').default;
const ical = require('ical-generator');
const { DateTime } = require('luxon');
const { htmlToText: htmlToTextWithOptions } = require('html-to-text');
const { parseStringPromise: parseXml, Builder: XMLBuilder } = require('xml2js');

const CALENDAR_NAME = 'Academic Calendar';
const CALENDAR_URL =
  'https://registrar.gatech.edu/academiccalendar/current/data.xml';
const CALENDAR_TIMEZONE = 'America/New_York';

exports.handler = async function (event, context) {
  const response = await axios.get(CALENDAR_URL, { responseType: 'text' });
  const xml = await parseXml(response.data);
  const [hostname] = event.headers.host.split(':', 1);
  const calendar = ical({
    domain: hostname,
    name: CALENDAR_NAME,
    timezone: CALENDAR_TIMEZONE,
    prodId: {
      company: 'Rishov Sarkar',
      product: 'GT Academic Calendar Regenerator',
      language: 'EN',
    },
  });

  xml.set.node.forEach((node) => {
    const [id] = node.id;
    const [term] = node.term;
    const [title] = node.title;
    const [textDescription] = node.textDescription;
    const [path] = node.path;
    const [updated] = node.updated;
    const [associatedLink] = node.associatedLink;
    const [eventAttrs] = node.eventAttrs;

    const allDay = node.timeStart[0].span[0]._ === '(All day)';
    const startUnix = parseInt(node.dateStartUnix[0].span[0]._, 10);
    const endUnix = parseInt(node.dateEndUnix[0].span[0]._, 10);
    const startDate = DateTime.fromSeconds(startUnix, {
      zone: CALENDAR_TIMEZONE,
    });
    const endDate = DateTime.fromSeconds(endUnix, {
      zone: CALENDAR_TIMEZONE,
    }).plus({ days: +allDay });

    const summary = `${title} | ${term}`;
    const baseHtmlDescription =
      generateParagraph(eventAttrs) +
      generateParagraph(textDescription) +
      generateLinks(path, associatedLink);
    const url = new URL(path, CALENDAR_URL).toString();
    const lastModified = DateTime.fromSeconds(parseInt(updated, 10)).toJSDate();
    const transparency = 'TRANSPARENT';

    if (!allDay || endDate.diff(startDate, 'days').days < 3) {
      const start = startDate.toJSDate();
      const end = endDate.toJSDate();
      const htmlDescription = baseHtmlDescription;
      const description = htmlToText(htmlDescription, { wordwrap: false });

      calendar.createEvent({
        id,
        start,
        end,
        summary,
        description,
        htmlDescription,
        allDay,
        url,
        lastModified,
        transparency,
      });
    } else {
      const startDateFirstDay = startDate;
      const endDateFirstDay = startDateFirstDay.plus({ days: 1 });
      const endDateLastDay = endDate;
      const startDateLastDay = endDateLastDay.minus({ days: 1 });
      const strFirstDay = startDateFirstDay.toLocaleString(DateTime.DATE_HUGE);
      const strLastDay = startDateLastDay.toLocaleString(DateTime.DATE_HUGE);

      const idFirstDay = `${id}.first_day`;
      const startFirstDay = startDateFirstDay.toJSDate();
      const endFirstDay = endDateFirstDay.toJSDate();
      const summaryFirstDay = `First Day of ${summary}`;
      const htmlDescriptionFirstDay =
        new XMLBuilder({ headless: true }).buildObject({
          p: `This event ends on ${strLastDay}.`,
        }) + baseHtmlDescription;
      const descriptionFirstDay = htmlToText(htmlDescriptionFirstDay, {
        wordwrap: false,
      });

      const idLastDay = `${id}.last_day`;
      const startLastDay = startDateLastDay.toJSDate();
      const endLastDay = endDateLastDay.toJSDate();
      const summaryLastDay = `Last Day of ${summary}`;
      const htmlDescriptionLastDay =
        new XMLBuilder({ headless: true }).buildObject({
          p: `This event starts on ${strFirstDay}.`,
        }) + baseHtmlDescription;
      const descriptionLastDay = htmlToText(htmlDescriptionLastDay, {
        wordwrap: false,
      });

      calendar.createEvent({
        id: idFirstDay,
        start: startFirstDay,
        end: endFirstDay,
        summary: summaryFirstDay,
        description: descriptionFirstDay,
        htmlDescription: htmlDescriptionFirstDay,
        allDay,
        url,
        lastModified,
        transparency,
      });
      calendar.createEvent({
        id: idLastDay,
        start: startLastDay,
        end: endLastDay,
        summary: summaryLastDay,
        description: descriptionLastDay,
        htmlDescription: htmlDescriptionLastDay,
        allDay,
        url,
        lastModified,
        transparency,
      });
    }
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/calendar' },
    body: calendar.toString(),
  };
};

function generateParagraph(html) {
  if (html === 'null') {
    return '';
  }
  if (!html.endsWith('.')) {
    html += '.';
  }
  return '<p>' + html + '</p>';
}

function generateLinks(path, associatedLink) {
  const lines = [];
  if (associatedLink !== 'null') {
    associatedLink = new URL(associatedLink, CALENDAR_URL).toString();
    lines.push('Link: ' + generateLink(associatedLink, associatedLink));
  }
  if (path !== 'null') {
    path = new URL(path, CALENDAR_URL).toString();
    lines.push('More info: ' + generateLink(path, path));
  }
  if (lines.length === 0) {
    return '';
  }
  return '<p>' + lines.join('<br />') + '</p>';
}

function generateLink(text, href) {
  return new XMLBuilder({ headless: true }).buildObject({
    a: { _: text, $: { href, target: '_blank' } },
  });
}

function htmlToText(html) {
  return htmlToTextWithOptions(html, {
    wordwrap: false,
    tags: {
      a: { options: { hideLinkHrefIfSameAsText: true } },
    },
  });
}
