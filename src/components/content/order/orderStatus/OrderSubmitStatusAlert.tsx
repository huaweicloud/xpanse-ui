/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { useStopwatch } from 'react-timer-hook';
import {
    DeployRequest,
    ErrorResponse,
    serviceHostingType,
    ServiceOrder,
    ServiceOrderStatusUpdate,
    ServiceProviderContactDetails,
    taskStatus,
} from '../../../../xpanse-api/generated';
import { convertStringArrayToUnorderedList } from '../../../utils/generateUnorderedList';
import { isHandleKnownErrorResponse } from '../../common/error/isHandleKnownErrorResponse.ts';
import { OperationType } from '../types/OperationType';
import { OrderProcessingStatus } from './OrderProcessingStatus.tsx';
import { OrderSubmitResult } from './OrderSubmitResult';

function OrderSubmitStatusAlert({
    serviceId,
    serviceHostType,
    submitDeploymentRequest,
    redeployFailedDeploymentQuery,
    getSubmitLatestServiceOrderStatusQuery,
    serviceProviderContactDetails,
    retryRequest,
    onClose,
}: {
    serviceId: string;
    serviceHostType: serviceHostingType;
    submitDeploymentRequest:
        | UseMutationResult<ServiceOrder, Error, DeployRequest>
        | UseMutationResult<ServiceOrder, Error, string>;
    redeployFailedDeploymentQuery: UseMutationResult<ServiceOrder, Error, string>;
    getSubmitLatestServiceOrderStatusQuery: UseQueryResult<ServiceOrderStatusUpdate>;
    serviceProviderContactDetails: ServiceProviderContactDetails | undefined;
    retryRequest: () => void;
    onClose: () => void;
}): React.JSX.Element {
    const stopWatch = useStopwatch({
        autoStart: true,
    });
    const msg = useMemo(() => {
        if (submitDeploymentRequest.isPending || redeployFailedDeploymentQuery.isPending) {
            return 'Request submission in-progress';
        } else if (redeployFailedDeploymentQuery.isError) {
            if (isHandleKnownErrorResponse(redeployFailedDeploymentQuery.error)) {
                const response: ErrorResponse = redeployFailedDeploymentQuery.error.body;
                return getOrderSubmissionFailedDisplay(response.errorType, response.details);
            } else {
                return getOrderSubmissionFailedDisplay(redeployFailedDeploymentQuery.error.name, [
                    redeployFailedDeploymentQuery.error.message,
                ]);
            }
        } else if (submitDeploymentRequest.isError) {
            if (isHandleKnownErrorResponse(submitDeploymentRequest.error)) {
                const response: ErrorResponse = submitDeploymentRequest.error.body;
                return getOrderSubmissionFailedDisplay(response.errorType, response.details);
            } else {
                return getOrderSubmissionFailedDisplay(submitDeploymentRequest.error.name, [
                    submitDeploymentRequest.error.message,
                ]);
            }
        } else if (submitDeploymentRequest.isSuccess || redeployFailedDeploymentQuery.isSuccess) {
            if (
                getSubmitLatestServiceOrderStatusQuery.isSuccess &&
                (getSubmitLatestServiceOrderStatusQuery.data.taskStatus.toString() ===
                    taskStatus.SUCCESSFUL.toString() ||
                    getSubmitLatestServiceOrderStatusQuery.data.taskStatus.toString() === taskStatus.FAILED.toString())
            ) {
                return (
                    <OrderProcessingStatus
                        operationType={OperationType.Deploy}
                        serviceOrderStatus={getSubmitLatestServiceOrderStatusQuery.data}
                        serviceId={serviceId}
                        selectedServiceHostingType={serviceHostType}
                    />
                );
            } else if (getSubmitLatestServiceOrderStatusQuery.isError) {
                if (serviceHostType === serviceHostingType.SERVICE_VENDOR) {
                    return 'Deployment status polling failed. Please visit MyServices page to check the status of the request and contact service vendor for error details.';
                } else {
                    return 'Deployment status polling failed. Please visit MyServices page to check the status of the request';
                }
            } else if (
                getSubmitLatestServiceOrderStatusQuery.isPending ||
                getSubmitLatestServiceOrderStatusQuery.data.taskStatus.toString() === taskStatus.IN_PROGRESS.toString()
            ) {
                return 'Deploying, Please wait...';
            }
        }
    }, [
        submitDeploymentRequest.isPending,
        submitDeploymentRequest.isError,
        submitDeploymentRequest.isSuccess,
        submitDeploymentRequest.error,
        redeployFailedDeploymentQuery.isPending,
        redeployFailedDeploymentQuery.isError,
        redeployFailedDeploymentQuery.isSuccess,
        redeployFailedDeploymentQuery.error,
        getSubmitLatestServiceOrderStatusQuery.isSuccess,
        getSubmitLatestServiceOrderStatusQuery.data,
        getSubmitLatestServiceOrderStatusQuery.isError,
        getSubmitLatestServiceOrderStatusQuery.isPending,
        serviceId,
        serviceHostType,
    ]);

    const alertType = useMemo(() => {
        if (submitDeploymentRequest.isPending || redeployFailedDeploymentQuery.isPending) {
            return 'success';
        } else if (
            redeployFailedDeploymentQuery.isError ||
            submitDeploymentRequest.isError ||
            getSubmitLatestServiceOrderStatusQuery.isError
        ) {
            if (stopWatch.isRunning) {
                stopWatch.pause();
            }
            return 'error';
        } else if (submitDeploymentRequest.isSuccess || redeployFailedDeploymentQuery.isSuccess) {
            if (
                getSubmitLatestServiceOrderStatusQuery.isSuccess &&
                getSubmitLatestServiceOrderStatusQuery.data.taskStatus.toString() === taskStatus.FAILED.toString()
            ) {
                if (stopWatch.isRunning) {
                    stopWatch.pause();
                }
                return 'error';
            } else if (
                getSubmitLatestServiceOrderStatusQuery.isSuccess &&
                getSubmitLatestServiceOrderStatusQuery.data.taskStatus.toString() === taskStatus.SUCCESSFUL.toString()
            ) {
                if (stopWatch.isRunning) {
                    stopWatch.pause();
                }
                return 'success';
            } else if (
                getSubmitLatestServiceOrderStatusQuery.isPending ||
                getSubmitLatestServiceOrderStatusQuery.data.taskStatus.toString() === taskStatus.IN_PROGRESS.toString()
            ) {
                return 'success';
            }
        }
        return 'success';
    }, [stopWatch, submitDeploymentRequest, redeployFailedDeploymentQuery, getSubmitLatestServiceOrderStatusQuery]);

    function getOrderSubmissionFailedDisplay(errorType: string, reasons: string[]) {
        return (
            <div>
                <span>{errorType.length > 0 ? errorType : 'Service deployment request failed.'}</span>
                <div>{convertStringArrayToUnorderedList(reasons)}</div>
            </div>
        );
    }

    const getServiceId = (): string => {
        if (submitDeploymentRequest.isSuccess) {
            return submitDeploymentRequest.data.serviceId;
        } else {
            if (
                isHandleKnownErrorResponse(submitDeploymentRequest.error) &&
                'serviceId' in submitDeploymentRequest.error.body
            ) {
                return submitDeploymentRequest.error.body.serviceId as string;
            } else {
                return serviceId;
            }
        }
    };

    const isDeployDisabled = () => {
        if (
            isHandleKnownErrorResponse(submitDeploymentRequest.error) &&
            !('orderId' in submitDeploymentRequest.error.body && 'serviceId' in submitDeploymentRequest.error.body)
        ) {
            return true;
        }

        if (
            isHandleKnownErrorResponse(redeployFailedDeploymentQuery.error) &&
            !(
                'orderId' in redeployFailedDeploymentQuery.error.body &&
                'serviceId' in redeployFailedDeploymentQuery.error.body
            )
        ) {
            return true;
        }
        return false;
    };

    return (
        <OrderSubmitResult
            msg={msg ?? ''}
            uuid={getServiceId()}
            type={alertType}
            stopWatch={stopWatch}
            isDeployRequestError={isDeployDisabled()}
            contactServiceDetails={alertType !== 'success' ? serviceProviderContactDetails : undefined}
            retryRequest={retryRequest}
            onClose={onClose}
        />
    );
}

export default OrderSubmitStatusAlert;
