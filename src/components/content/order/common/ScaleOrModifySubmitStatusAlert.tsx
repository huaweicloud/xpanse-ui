/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { useStopwatch } from 'react-timer-hook';
import {
    DeployedServiceDetails,
    ErrorResponse,
    orderStatus,
    serviceDeploymentState,
    serviceHostingType,
    ServiceOrder,
    ServiceOrderStatusUpdate,
    ServiceProviderContactDetails,
    VendorHostedDeployedServiceDetails,
} from '../../../../xpanse-api/generated';
import { convertStringArrayToUnorderedList } from '../../../utils/generateUnorderedList';
import { isHandleKnownErrorResponse } from '../../common/error/isHandleKnownErrorResponse.ts';
import { OrderProcessingStatus } from '../orderStatus/OrderProcessingStatus.tsx';
import { OperationType } from '../types/OperationType';
import { ScaleOrModifyOrderSubmitResult } from './ScaleOrModifyOrderSubmitResult';
import { ModifySubmitRequest } from './modifySubmitRequest.ts';

function ScaleOrModifySubmitStatusAlert({
    modifyServiceRequest,
    getScaleOrModifyServiceOrderStatusQuery,
    currentSelectedService,
    serviceProviderContactDetails,
    getModifyDetailsStatus,
}: {
    modifyServiceRequest: UseMutationResult<ServiceOrder, Error, ModifySubmitRequest>;
    getScaleOrModifyServiceOrderStatusQuery: UseQueryResult<ServiceOrderStatusUpdate>;
    currentSelectedService: DeployedServiceDetails | VendorHostedDeployedServiceDetails;
    serviceProviderContactDetails: ServiceProviderContactDetails | undefined;
    getModifyDetailsStatus: (arg: serviceDeploymentState | undefined) => void;
}): React.JSX.Element {
    const stopWatch = useStopwatch({
        autoStart: true,
    });

    const msg = useMemo(() => {
        if (modifyServiceRequest.isPending) {
            return 'Request submission in-progress';
        } else if (modifyServiceRequest.isError) {
            if (isHandleKnownErrorResponse(modifyServiceRequest.error)) {
                const response: ErrorResponse = modifyServiceRequest.error.body;
                return getOrderSubmissionFailedDisplay(response.errorType, response.details);
            } else {
                return getOrderSubmissionFailedDisplay(modifyServiceRequest.error.name, [
                    modifyServiceRequest.error.message,
                ]);
            }
        } else if (modifyServiceRequest.isSuccess) {
            if (
                getScaleOrModifyServiceOrderStatusQuery.isSuccess &&
                (getScaleOrModifyServiceOrderStatusQuery.data.orderStatus.toString() ===
                    orderStatus.SUCCESSFUL.toString() ||
                    getScaleOrModifyServiceOrderStatusQuery.data.orderStatus.toString() ===
                        orderStatus.FAILED.toString())
            ) {
                return (
                    <OrderProcessingStatus
                        operationType={OperationType.Modify}
                        serviceOrderStatus={getScaleOrModifyServiceOrderStatusQuery.data}
                        serviceId={currentSelectedService.serviceId}
                        selectedServiceHostingType={currentSelectedService.serviceHostingType as serviceHostingType}
                    />
                );
            } else if (getScaleOrModifyServiceOrderStatusQuery.isError) {
                if (currentSelectedService.serviceHostingType === serviceHostingType.SERVICE_VENDOR) {
                    return 'Modification status polling failed. Please visit MyServices page to check the status of the request and contact service vendor for error details.';
                } else {
                    return 'Modification status polling failed. Please visit MyServices page to check the status of the request';
                }
            } else if (
                getScaleOrModifyServiceOrderStatusQuery.isPending ||
                getScaleOrModifyServiceOrderStatusQuery.data.orderStatus.toString() ===
                    orderStatus.IN_PROGRESS.toString()
            ) {
                return 'Modifying, Please wait...';
            }
        }
    }, [
        modifyServiceRequest.isPending,
        modifyServiceRequest.isError,
        modifyServiceRequest.isSuccess,
        modifyServiceRequest.error,
        getScaleOrModifyServiceOrderStatusQuery.isSuccess,
        getScaleOrModifyServiceOrderStatusQuery.isError,
        getScaleOrModifyServiceOrderStatusQuery.isPending,
        getScaleOrModifyServiceOrderStatusQuery.data,
        currentSelectedService.serviceId,
        currentSelectedService.serviceHostingType,
    ]);

    const alertType = useMemo(() => {
        if (modifyServiceRequest.isPending) {
            return 'success';
        } else if (modifyServiceRequest.isError || getScaleOrModifyServiceOrderStatusQuery.isError) {
            if (stopWatch.isRunning) {
                stopWatch.pause();
            }
            getModifyDetailsStatus(serviceDeploymentState.MODIFICATION_FAILED);
            return 'error';
        } else if (modifyServiceRequest.isSuccess) {
            if (
                getScaleOrModifyServiceOrderStatusQuery.isSuccess &&
                getScaleOrModifyServiceOrderStatusQuery.data.orderStatus.toString() === orderStatus.FAILED.toString()
            ) {
                if (stopWatch.isRunning) {
                    stopWatch.pause();
                }
                getModifyDetailsStatus(serviceDeploymentState.MODIFICATION_FAILED);
                return 'error';
            } else if (
                getScaleOrModifyServiceOrderStatusQuery.isSuccess &&
                getScaleOrModifyServiceOrderStatusQuery.data.orderStatus.toString() ===
                    orderStatus.SUCCESSFUL.toString()
            ) {
                if (stopWatch.isRunning) {
                    stopWatch.pause();
                }
                getModifyDetailsStatus(serviceDeploymentState.MODIFICATION_SUCCESSFUL);
                return 'success';
            } else if (
                getScaleOrModifyServiceOrderStatusQuery.isPending ||
                getScaleOrModifyServiceOrderStatusQuery.data.orderStatus.toString() ===
                    orderStatus.IN_PROGRESS.toString()
            ) {
                return 'success';
            }
        }
        return 'success';
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stopWatch, modifyServiceRequest, getScaleOrModifyServiceOrderStatusQuery]);

    function getOrderSubmissionFailedDisplay(errorType: string, reasons: string[]) {
        return (
            <div>
                <span>{errorType.length > 0 ? errorType : 'Service modification request failed.'}</span>
                <div>{convertStringArrayToUnorderedList(reasons)}</div>
            </div>
        );
    }

    const getOrderId = (): string => {
        if (modifyServiceRequest.isSuccess) {
            return modifyServiceRequest.data.orderId;
        } else {
            if (
                isHandleKnownErrorResponse(modifyServiceRequest.error) &&
                'orderId' in modifyServiceRequest.error.body
            ) {
                return modifyServiceRequest.error.body.orderId as string;
            }
            return '-';
        }
    };

    return (
        <ScaleOrModifyOrderSubmitResult
            msg={msg ?? ''}
            serviceId={currentSelectedService.serviceId}
            orderId={getOrderId()}
            type={alertType}
            stopWatch={stopWatch}
            contactServiceDetails={alertType !== 'success' ? serviceProviderContactDetails : undefined}
        />
    );
}

export default ScaleOrModifySubmitStatusAlert;
