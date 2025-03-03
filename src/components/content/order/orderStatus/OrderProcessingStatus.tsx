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
    actionName,
}: {
    operationType: OperationType;
    serviceOrderStatus: ServiceOrderStatusUpdate;
    serviceId: string;
    selectedServiceHostingType: serviceHostingType;
    actionName?: string;
}): React.JSX.Element => {
    const errorMsg: string = 'Please contact service vendor for error details.';
    if (
        operationType === OperationType.Deploy ||
        operationType === OperationType.Recreate ||
        operationType === OperationType.Port
    ) {
        if (serviceOrderStatus.orderStatus === 'successful') {
            return (
                <OrderEndPointDetails
                    serviceOrderStatus={serviceOrderStatus}
                    serviceId={serviceId}
                    selectedServiceHostingType={selectedServiceHostingType}
                    operationType={operationType}
                />
            );
        } else if (serviceOrderStatus.orderStatus === 'failed') {
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
        if (serviceOrderStatus.orderStatus === 'successful') {
            return (
                <OrderEndPointDetails
                    serviceOrderStatus={serviceOrderStatus}
                    serviceId={serviceId}
                    selectedServiceHostingType={selectedServiceHostingType}
                    operationType={operationType}
                />
            );
        } else if (serviceOrderStatus.orderStatus === 'failed') {
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
        if (serviceOrderStatus.orderStatus === 'successful') {
            return (
                <div>
                    <span>{'Destroyed Successfully.'}</span>
                </div>
            );
        } else if (serviceOrderStatus.orderStatus === 'failed') {
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

    if (operationType === OperationType.UpdateConfig) {
        if (serviceOrderStatus.orderStatus === 'successful') {
            return (
                <div>
                    <span>{'Service configuration updated successfully.'}</span>
                </div>
            );
        } else if (serviceOrderStatus.orderStatus === 'failed') {
            return (
                <div>
                    <span>{'Service configuration updated failed.'}</span>
                    <div>
                        {selectedServiceHostingType === serviceHostingType.SELF
                            ? serviceOrderStatus.error?.details.join()
                            : errorMsg}
                    </div>
                </div>
            );
        }
    }

    if (operationType === OperationType.Action) {
        if (serviceOrderStatus.orderStatus === 'successful') {
            return (
                <div>
                    <span>
                        <b>{actionName}</b>
                        {` request submitted successfully.`}
                    </span>
                </div>
            );
        } else if (serviceOrderStatus.orderStatus === 'failed') {
            return (
                <div>
                    <span>
                        <b>{actionName}</b>
                        {` request failed.`}
                    </span>
                    <div>
                        {selectedServiceHostingType === serviceHostingType.SELF
                            ? serviceOrderStatus.error?.details.join()
                            : errorMsg}
                    </div>
                </div>
            );
        }
    }

    if (operationType === OperationType.Restart) {
        if (serviceOrderStatus.orderStatus === 'successful') {
            return (
                <div>
                    <span>{'Service restarted successfully.'}</span>
                </div>
            );
        } else if (serviceOrderStatus.orderStatus === 'failed') {
            return (
                <div>
                    <span>{'Service restarted failed.'}</span>
                    <div>
                        {selectedServiceHostingType === serviceHostingType.SELF
                            ? serviceOrderStatus.error?.details.join()
                            : errorMsg}
                    </div>
                </div>
            );
        }
    }

    if (operationType === OperationType.Start) {
        if (serviceOrderStatus.orderStatus === 'successful') {
            return (
                <div>
                    <span>{'Service started successfully.'}</span>
                </div>
            );
        } else if (serviceOrderStatus.orderStatus === 'failed') {
            return (
                <div>
                    <span>{'Service started failed.'}</span>
                    <div>
                        {selectedServiceHostingType === serviceHostingType.SELF
                            ? serviceOrderStatus.error?.details.join()
                            : errorMsg}
                    </div>
                </div>
            );
        }
    }

    if (operationType === OperationType.Stop) {
        if (serviceOrderStatus.orderStatus === 'successful') {
            return (
                <div>
                    <span>{'Service stopped successfully.'}</span>
                </div>
            );
        } else if (serviceOrderStatus.orderStatus === 'failed') {
            return (
                <div>
                    <span>{'Service stopped failed.'}</span>
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
