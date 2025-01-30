/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import React from 'react';
import { serviceHostingType, ServiceOrderStatusUpdate } from '../../../../xpanse-api/generated';
import { OperationType } from '../types/OperationType';
import { OrderEndPointDetails } from './OrderEndPointDetails.tsx';

export const OrderProcessingStatus = ({
    operationType,
    serviceOrderStatus,
    serviceId,
    selectedServiceHostingType,
}: {
    operationType: OperationType;
    serviceOrderStatus: ServiceOrderStatusUpdate;
    serviceId: string;
    selectedServiceHostingType: serviceHostingType;
}): React.JSX.Element => {
    const errorMsg: string = 'Please contact service vendor for error details.';
    if (operationType === OperationType.Deploy) {
        if (serviceOrderStatus.taskStatus === 'successful') {
            return (
                <OrderEndPointDetails
                    serviceOrderStatus={serviceOrderStatus}
                    serviceId={serviceId}
                    selectedServiceHostingType={selectedServiceHostingType}
                    operationType={operationType}
                />
            );
        } else if (serviceOrderStatus.taskStatus === 'failed') {
            return (
                <div>
                    <span>{serviceOrderStatus.error?.errorType.toString()}</span>
                    <div>
                        {selectedServiceHostingType === serviceHostingType.SELF
                            ? serviceOrderStatus.error?.details.join()
                            : errorMsg}
                    </div>
                </div>
            );
        }
    }

    if (operationType === OperationType.Modify) {
        if (serviceOrderStatus.taskStatus === 'successful') {
            return (
                <OrderEndPointDetails
                    serviceOrderStatus={serviceOrderStatus}
                    serviceId={serviceId}
                    selectedServiceHostingType={selectedServiceHostingType}
                    operationType={operationType}
                />
            );
        } else if (serviceOrderStatus.taskStatus === 'failed') {
            return (
                <div>
                    <span>{'Modification Failed.'}</span>
                    <div>
                        {selectedServiceHostingType === serviceHostingType.SELF
                            ? serviceOrderStatus.error?.details.join()
                            : errorMsg}
                    </div>
                </div>
            );
        }
    }

    if (operationType === OperationType.Destroy) {
        if (serviceOrderStatus.taskStatus === 'successful') {
            return (
                <div>
                    <span>{'Destroyed Successfully'}</span>
                </div>
            );
        } else if (serviceOrderStatus.taskStatus === 'failed') {
            return (
                <div>
                    <span>{'Destroyed Failed.'}</span>
                    <div>
                        {selectedServiceHostingType === serviceHostingType.SELF
                            ? serviceOrderStatus.error?.details.join()
                            : errorMsg}
                    </div>
                </div>
            );
        }
    }
    return <></>;
};
