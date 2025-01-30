/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import { Skeleton } from 'antd';
import React from 'react';
import submitResultStyles from '../../../../styles/submit-result.module.css';
import { serviceHostingType, ServiceOrderStatusUpdate } from '../../../../xpanse-api/generated';
import { convertMapToDetailsList } from '../../../utils/convertMapToDetailsList.tsx';
import FallbackSkeleton from '../../common/lazy/FallBackSkeleton.tsx';
import { useServiceDetailsByServiceIdQuery } from '../../common/queries/useServiceDetailsByServiceIdQuery.ts';
import { OperationType } from '../types/OperationType.ts';

export function OrderEndPointDetails({
    serviceOrderStatus,
    serviceId,
    selectedServiceHostingType,
    operationType,
}: {
    serviceOrderStatus: ServiceOrderStatusUpdate;
    serviceId: string;
    selectedServiceHostingType: serviceHostingType;
    operationType: OperationType;
}): React.JSX.Element {
    const endPointMap = new Map<string, string>();
    const deployServiceDetailsQuery = useServiceDetailsByServiceIdQuery(
        serviceId,
        selectedServiceHostingType,
        serviceOrderStatus.taskStatus
    );
    if (
        deployServiceDetailsQuery.isPending ||
        deployServiceDetailsQuery.isFetching ||
        deployServiceDetailsQuery.isRefetching
    ) {
        return <Skeleton />;
    }
    if (deployServiceDetailsQuery.data) {
        if (deployServiceDetailsQuery.data.deployedServiceProperties) {
            for (const key in deployServiceDetailsQuery.data.deployedServiceProperties) {
                endPointMap.set(key, deployServiceDetailsQuery.data.deployedServiceProperties[key]);
            }
        }
        if (endPointMap.size > 0) {
            return (
                <>
                    <span>
                        {operationType === OperationType.Deploy ? 'Deployment Successful' : 'Modification Successful'}
                    </span>
                    <div className={submitResultStyles.resultContainer}>
                        {convertMapToDetailsList(endPointMap, 'Endpoint Information')}
                    </div>
                </>
            );
        } else {
            return (
                <span>
                    {operationType === OperationType.Deploy ? 'Deployment Successful' : 'Modification Successful'}
                </span>
            );
        }
    }
    return <FallbackSkeleton />;
}
