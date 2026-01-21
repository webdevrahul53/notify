import { Report } from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import React from 'react'

const FieldError = ({message}) => {
  return (
    <Tooltip title={message} placement="top" arrow
    slotProps={{
        tooltip: {
          sx: {
            bgcolor: 'error.main',
            color: 'common.white',
            fontSize: '0.75rem',
            px: 1,
            py: 0.5,
            borderRadius: 1,
          },
        },
      }}>
        <Report color="error" />
    </Tooltip>
)
}

export default FieldError