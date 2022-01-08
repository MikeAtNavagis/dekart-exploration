package dekart

import (
	"context"
	"dekart/src/proto"
	"fmt"
	"time"

	"github.com/rs/zerolog/log"
)

func (s Server) getQueries(ctx context.Context, reportID string) ([]*proto.Query, error) {
	queryRows, err := s.db.QueryContext(ctx,
		`select
			id,
			query_text,
			job_status,
			case when job_result_id is null then '' else cast(job_result_id as VARCHAR) end as job_result_id,
			case when job_error is null then '' else job_error end as job_error,
			case
				when job_started is null
				then 0
				else CAST((extract('epoch' from CURRENT_TIMESTAMP)  - extract('epoch' from job_started))*1000 as BIGINT)
			end as job_duration,
			total_rows,
			bytes_processed,
			result_size,
			created_at,
			updated_at,
			query_source,
			query_source_id
		from queries where report_id=$1 order by created_at asc`,
		reportID,
	)
	if err != nil {
		log.Err(err).Str("reportID", reportID).Msg("select from queries failed")
		return nil, err
	}
	defer queryRows.Close()
	queries := make([]*proto.Query, 0)
	for queryRows.Next() {
		var queryText string
		query := proto.Query{
			ReportId: reportID,
		}
		var createdAt time.Time
		var updatedAt time.Time
		if err := queryRows.Scan(
			&query.Id,
			&queryText,
			&query.JobStatus,
			&query.JobResultId,
			&query.JobError,
			&query.JobDuration,
			&query.TotalRows,
			&query.BytesProcessed,
			&query.ResultSize,
			&createdAt,
			&updatedAt,
			&query.QuerySource,
			&query.QuerySourceId,
		); err != nil {
			log.Err(err).Send()
			return nil, err
		}

		switch query.QuerySource {
		case proto.Query_QUERY_SOURCE_UNSPECIFIED:
			err = fmt.Errorf("unknown query source query id=%s", query.Id)
			log.Err(err).Send()
			return nil, err
		case proto.Query_QUERY_SOURCE_INLINE:
			query.QueryText = queryText
		}
		query.CreatedAt = createdAt.Unix()
		query.UpdatedAt = updatedAt.Unix()
		switch query.JobStatus {
		case proto.Query_JOB_STATUS_UNSPECIFIED:
			query.JobDuration = 0
		case proto.Query_JOB_STATUS_DONE:
			if query.JobResultId != "" {
				query.JobDuration = 0
			}
		}
		queries = append(queries, &query)
	}
	return queries, nil
}
