import React from 'react';
import { Alert } from 'antd';
import styles from './ErrorMessage.css';
import { ALERT } from '../AntdTypes';
import { withTranslation } from '../../util';

const CREATE_ISSUE_URL = 'https://github.com/appium/appium-inspector/issues/new/choose';

const ErrorMessage = ({ error, t }) => (
  <div className={styles.errorMessage}>
    <Alert
      message={<>{t('Unexpected Error:')} <code children={error.message} /></>}
      type={ALERT.ERROR}
      showIcon
      description={
        <>
          {t('Please report this issue at:')} <a href={CREATE_ISSUE_URL} children={CREATE_ISSUE_URL} />
          <br />
          {t('Full error trace:')}
          <pre children={error.stack} />
        </>
      }
    />
  </div>
);

export default withTranslation(ErrorMessage);
