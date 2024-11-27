/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import React from 'react';
import serviceReviewStyles from '../../../../styles/service-review.module.css';
import { serviceTemplateRegistrationState } from '../../../../xpanse-api/generated';

export function ServiceTemplateRegisterStatus({
    serviceRegistrationStatus,
}: {
    serviceRegistrationStatus: serviceTemplateRegistrationState;
}): React.JSX.Element {
    switch (serviceRegistrationStatus) {
        case serviceTemplateRegistrationState.IN_REVIEW:
            return (
                <Tag
                    bordered={false}
                    icon={<SyncOutlined spin={false} />}
                    color='processing'
                    className={serviceReviewStyles.serviceTemplateStateSize}
                >
                    {serviceRegistrationStatus.valueOf()}
                </Tag>
            );
        case serviceTemplateRegistrationState.REJECTED:
            return (
                <Tag
                    bordered={false}
                    icon={<CloseCircleOutlined />}
                    color='magenta'
                    className={serviceReviewStyles.serviceTemplateStateSize}
                >
                    {serviceRegistrationStatus.valueOf()}
                </Tag>
            );
        case serviceTemplateRegistrationState.APPROVED:
            return (
                <Tag
                    bordered={false}
                    icon={<CheckCircleOutlined />}
                    color='success'
                    className={serviceReviewStyles.serviceTemplateStateSize}
                >
                    {serviceRegistrationStatus.valueOf()}
                </Tag>
            );
        default:
            return (
                <Tag
                    bordered={false}
                    icon={<ExclamationCircleOutlined />}
                    color='warning'
                    className={serviceReviewStyles.serviceTemplateStateSize}
                >
                    {serviceRegistrationStatus as unknown as string}
                </Tag>
            );
    }
}
