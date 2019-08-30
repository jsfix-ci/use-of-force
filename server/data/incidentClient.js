const format = require('pg-format')
const db = require('./dataAccess/db')
const { ReportStatus, StatementStatus } = require('../config/types')

const createDraftReport = async ({ userId, bookingId, reporterName, offenderNo, incidentDate, formResponse }) => {
  const nextSequence = `(select COALESCE(MAX(sequence_no), 0) + 1 from report where booking_id = $5 and user_id = $2)`
  const result = await db.query({
    text: `insert into report (form_response, user_id, reporter_name, offender_no, booking_id, status, incident_date, sequence_no, created_date)
            values ($1, CAST($2 AS VARCHAR), $3, $4, $5, $6, $7, ${nextSequence}, CURRENT_TIMESTAMP)
            returning id`,
    values: [formResponse, userId, reporterName, offenderNo, bookingId, ReportStatus.IN_PROGRESS.value, incidentDate],
  })
  return result.rows[0].id
}

const updateDraftReport = (reportId, incidentDate, formResponse) => {
  return db.query({
    text: `update report r set form_response = $1, incident_date = COALESCE($2, r.incident_date) where r.id = $3`,
    values: [formResponse, incidentDate, reportId],
  })
}

const maxSequenceForBooking =
  '(select max(r2.sequence_no) from report r2 where r2.booking_id = r.booking_id and user_id = r.user_id)'

const submitReport = (userId, bookingId) => {
  return db.query({
    text: `update report r set status = $1, submitted_date = CURRENT_TIMESTAMP 
    where user_id = $2
    and booking_id = $3
    and status = $4
    and r.sequence_no = ${maxSequenceForBooking}`,
    values: [ReportStatus.SUBMITTED.value, userId, bookingId, ReportStatus.IN_PROGRESS.value],
  })
}

const getCurrentDraftReport = async (userId, bookingId, query = db.query) => {
  const results = await query({
    text: `select id, incident_date, form_response from report r
          where user_id = $1
          and booking_id = $2
          and status = $3
          and r.sequence_no = ${maxSequenceForBooking}`,
    values: [userId, bookingId, ReportStatus.IN_PROGRESS.value],
  })
  return results.rows[0] || {}
}

const getStatementsForUser = (userId, status, query = db.query) => {
  return query({
    text: `select r.id, r.booking_id, r.reporter_name, r.offender_no, r.incident_date, s."name"
            from statement s 
            inner join report r on s.report_id = r.id   
          where r.status = $1 
          and s.user_id = $2 
          and s.statement_status = $3`,
    values: ['SUBMITTED', userId, status.value],
  })
}

const getStatement = async (userId, reportId, status, query = db.query) => {
  const results = await query({
    text: `select s.id
    ,      r.booking_id             "bookingId"
    ,      r.incident_date          "incidentDate"
    ,      s.last_training_month    "lastTrainingMonth"
    ,      s.last_training_year     "lastTrainingYear"
    ,      s.job_start_year         "jobStartYear"
    ,      s.statement
    ,      s.submitted_date         "submittedDate"
    from report r 
    left join statement s on r.id = s.report_id
    where r.id = $1 and s.user_id = $2 and s.statement_status = $3`,
    values: [reportId, userId, status.value],
  })
  return results.rows[0]
}

const getAdditionalComments = async statementId => {
  const results = await db.query({
    text: `select  
    s.additional_comment "additionalComment",
    s.date_submitted   "dateSubmitted" 
    from statement_amendments s
    where s.statement_id = $1`,
    values: [statementId],
  })
  return results.rows
}

const saveStatement = (
  userId,
  reportId,
  { lastTrainingMonth, lastTrainingYear, jobStartYear, statement },
  query = db.query
) => {
  return query({
    text: `update statement 
    set last_training_month = $1
    ,   last_training_year = $2
    ,   job_start_year = $3
    ,   statement = $4
    ,   updated_date = CURRENT_TIMESTAMP
    where user_id = $5
    and report_id = $6
    and statement_status = $7`,
    values: [
      lastTrainingMonth,
      lastTrainingYear,
      jobStartYear,
      statement,
      userId,
      reportId,
      StatementStatus.PENDING.value,
    ],
  })
}

const submitStatement = (userId, reportId, query = db.query) => {
  return query({
    text: `update statement 
    set submitted_date = CURRENT_TIMESTAMP
    ,   statement_status = $1
    ,   updated_date = CURRENT_TIMESTAMP
    where user_id = $2
    and report_id = $3
    and statement_status = $4`,
    values: [StatementStatus.SUBMITTED.value, userId, reportId, StatementStatus.PENDING.value],
  })
}

const getInvolvedStaff = async (reportId, query = db.query) => {
  const results = await query({
    text: 'select form_response from report where id = $1',
    values: [reportId],
  })

  if (results.rows.length) {
    const { form_response: { incidentDetails: { involvedStaff = [] } = {} } = {} } = results.rows[0]
    return involvedStaff
  }
  return []
}

const createStatements = async (reportId, staff) => {
  const rows = staff.map(s => [reportId, s.staffId, s.userId, s.name, s.email, StatementStatus.PENDING.value])
  const results = await db.query({
    text: format(
      'insert into statement (report_id, staff_id, user_id, name, email, statement_status) VALUES %L returning id',
      rows
    ),
  })
  return results.rows.map(row => row.id)
}

module.exports = {
  createDraftReport,
  updateDraftReport,
  submitReport,
  getCurrentDraftReport,
  getStatementsForUser,
  getStatement,
  getInvolvedStaff,
  createStatements,
  saveStatement,
  submitStatement,
  getAdditionalComments,
}
