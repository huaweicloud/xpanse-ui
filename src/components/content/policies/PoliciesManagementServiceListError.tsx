/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import { Alert } from 'antd';
import React from 'react';
import errorAlertStyles from '../../../styles/error-alert.module.css';
import { ApiError, Response } from '../../../xpanse-api/generated';
import { convertStringArrayToUnorderedList } from '../../utils/generateUnorderedList';

export default function PoliciesManagementServiceListError({ error }: { error: unknown }): React.JSX.Element {
    if (error instanceof ApiError && error.body && 'details' in error.body) {
        const response: Response = error.body as Response;
        return (
            <div>
                <Alert
                    message={response.resultType.valueOf()}
                    description={convertStringArrayToUnorderedList(response.details)}
                    type={'error'}
                    closable={false}
                    className={errorAlertStyles.errorFailureAlert}
                />
            </div>
        );
    } else {
        return (
            <div>
                <Alert
                    message='Fetching Policies Management Service Details Failed'
                    description={(error as Error).message}
                    type={'error'}
                    closable={false}
                    className={errorAlertStyles.errorFailureAlert}
                />
            </div>
        );
    }
}
