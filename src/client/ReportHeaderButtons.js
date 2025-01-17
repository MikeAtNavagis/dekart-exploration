import { useHistory } from 'react-router'
import styles from './ReportHeaderButtons.module.css'
import Button from 'antd/es/button'
import { saveMap, forkReport, copyUrlToClipboard } from './actions'
import { CopyOutlined, SaveOutlined, PlaySquareOutlined, EditOutlined, ConsoleSqlOutlined, ForkOutlined } from '@ant-design/icons'
import { useDispatch } from 'react-redux'

function CopyLinkButton () {
  const dispatch = useDispatch()
  return (
    <Button
      type='text'
      icon={<CopyOutlined />}
      size='large'
      title='Copy link to report'
      onClick={() => dispatch(copyUrlToClipboard(window.location.toString()))}
    />
  )
}

function ForkButton ({ reportId, disabled, primary }) {
  const dispatch = useDispatch()
  if (primary) {
    return (
      <Button
        type='primary'
        icon={<ForkOutlined />}
        disabled={disabled}
        onClick={() => dispatch(forkReport(reportId))}
      >Fork
      </Button>
    )
  }
  return (
    <Button
      type='text'
      icon={<ForkOutlined />}
      disabled={disabled}
      onClick={() => dispatch(forkReport(reportId))}
      title='Fork Report'
    />
  )
}

export default function ReportHeaderButtons ({ edit, changed, canSave, reportId, canWrite }) {
  const dispatch = useDispatch()
  const history = useHistory()
  if (edit) {
    return (
      <div className={styles.reportHeaderButtons}>
        {canWrite
          ? (
            <>
              <Button
                type='primary'
                icon={<SaveOutlined />}
                disabled={!canSave}
                onClick={() => dispatch(saveMap())}
              >Save{changed ? '*' : ''}
              </Button>
              <ForkButton reportId={reportId} disabled={!canSave} />
            </>
            )
          : <ForkButton reportId={reportId} primary disabled={!canSave} />}
        <Button
          type='text'
          icon={<PlaySquareOutlined />}
          size='large'
          disabled={changed}
          title='Present Mode'
          onClick={() => history.replace(`/reports/${reportId}`)}
        />
        <CopyLinkButton />
      </div>
    )
  }
  if (canWrite) {
    return (
      <div className={styles.reportHeaderButtons}>
        <Button
          type='primary'
          disabled={!canWrite}
          icon={<EditOutlined />}
          onClick={() => history.replace(`/reports/${reportId}/source`)}
        >Edit
        </Button>
        <ForkButton reportId={reportId} disabled={!canSave} />
        <CopyLinkButton />
      </div>
    )
  }
  return (
    <div className={styles.reportHeaderButtons}>
      <ForkButton reportId={reportId} primary disabled={!canSave} />
      <Button
        type='text'
        icon={<ConsoleSqlOutlined />}
        onClick={() => history.replace(`/reports/${reportId}/source`)}
        title='View SQL source'
      />
      <CopyLinkButton />
    </div>
  )
}
