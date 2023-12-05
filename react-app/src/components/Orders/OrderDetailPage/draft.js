import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  thunkGetOrderDetails,
  thunkCancelOrder,
  thunkUpdateOrderStatus,
} from "../../../store/orders";
import CancelOrderButton from "../CancelOrderButton";
import ReorderComponent from "../ReorderComponent";
import DeleteOrder from "../DeleteOrder";
import OpenModalButton from "../../Modals/OpenModalButton";
import {
  FaShippingFast,
  FaCreditCard,
  FaBoxOpen,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaRegClock,
} from "react-icons/fa";

import { calculateTax } from "../../../assets/helpers/helpers";

import "./OrderDetailPage.css";

const OrderDetailPage = ({ orderIdProp }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const initialLoadDone = useRef(false);
  const { orderId: orderIdFromUrl } = useParams();
  const orderId = orderIdProp || orderIdFromUrl;
  const order = useSelector((state) => state.orders.orders.byId[orderId]);
  const orderItems = useSelector((state) => state.orders.orderItems.byId);
  const menuItems = useSelector((state) => state.orders.menuItems.byId);
  const currentUserId = useSelector((state) => state.session.user?.id);
  const isLoading = useSelector((state) => state.orders.isLoading);
  const error = useSelector((state) => state.orders.error);
  const orderStatus = useSelector(state => state.orders.orders.byId[orderId]?.status);

  const [fetchError, setFetchError] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  const orderAndDeliverySubtotal =
    parseFloat(order?.total_price) + parseFloat(order?.delivery?.cost);
  const orderTaxAmount = calculateTax(orderAndDeliverySubtotal);
  const totalWithTax = orderAndDeliverySubtotal + orderTaxAmount;
  const formattedFinalTotal = totalWithTax?.toFixed(2);

  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    if (
      orderId &&
      (!order || order.id !== orderId) &&
      !initialLoadDone.current
    ) {
      setIsFetching(true);
      dispatch(thunkGetOrderDetails(orderId))
        .catch((error) => {
          console.error("Error fetching order details:", error);
          setFetchError("Failed to load order details.");
        })
        .finally(() => {
          setIsFetching(false);
          initialLoadDone.current = true;
        });
    }
  }, [dispatch, orderId, order]);

  // Check for loading states
  // if (isLoading || isFetching) return <p>Loading order details...</p>;
  // Check for errors
  // if (error || fetchError) return <p>Error fetching Order Detail: {error || fetchError}</p>;
  // Check if order details are available
  // Check if dataFetched is true before showing "not found" message
  if (dataFetched && !order) return <p>Order details not found.</p>;

  // Check if the user has permission to view the order
  if (order?.user_id !== currentUserId) return null;

  // Generate list of items for the order
  const itemsList = Object.values(orderItems)
    .filter((item) => item?.order_id === order?.id)
    .map((item) => {
      const menuItem = menuItems[item?.menu_item_id];
      return {
        ...item,
        name: menuItem?.name,
        price: menuItem?.price,
      };
    });

  return (
    <div className="order-detail-page">
      <div className="order-header">
        <h1>Order #{order?.id}</h1>
        <p className="order-date">
          {new Date(order?.date).toLocaleDateString()}
        </p>
        {/* <p className={`order-status ${order?.status?.toLowerCase()}`}> */}
        <p className={`order-status ${order?.status?.toLowerCase()}`}>
          {order?.status}
        </p>
      </div>

      <div className="order-body">
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {itemsList?.map((item, index) => (
              <div className="item-card" key={index}>
                <div className="item-name">{item.name}</div>
                <div className="item-quantity-price">
                  <span>Qty: {item.quantity}</span>
                  <span>${item?.price?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="summary-costs">
            <div className="cost-item">
              <span>Subtotal:</span>
              <span>${order?.total_price.toFixed(2)}</span>
            </div>
            <div className="cost-item">
              <span>Tax:</span>
              <span>${orderTaxAmount?.toFixed(2)}</span>
            </div>
            <div className="cost-item">
              <span>Delivery Fee:</span>
              <span>${parseFloat(order?.delivery?.cost || 0).toFixed(2)}</span>
            </div>
            <div className="total-cost">
              <strong>Total:</strong>
              <strong>${formattedFinalTotal}</strong>
            </div>
          </div>
        </div>

        <div className="additional-info">
          <div className="delivery-info">
            <h3>
              <FaMapMarkerAlt /> Delivery Information
            </h3>
            <div className="info-detail">
              <strong>Address:</strong>
              <p>
                {order?.delivery?.street_address}, {order?.delivery?.city},{" "}
                {order?.delivery?.state}, {order?.delivery?.country}
              </p>
            </div>
            <div className="info-detail">
              <strong>Postal Code:</strong>
              <p>{order?.delivery?.postal_code}</p>
            </div>
            <div className="info-detail">
              <strong>Tracking Number:</strong>
              <p>{order?.delivery?.tracking_number}</p>
            </div>
          </div>

          <div className="payment-info">
            <h3>
              <FaCreditCard /> Payment Details
            </h3>
            <div className="info-detail">
              <strong>Method:</strong>
              <p>{order?.payment?.gateway}</p>
            </div>
            <div className="info-detail">
              <strong>Transaction ID:</strong>
              <p>{order?.payment?.id}</p>
            </div>
          </div>
        </div>

        {/* {order?.status === "Completed" && (
          <OpenModalButton
            className="cancel-button"
            buttonText="Cancel Order"
            modalComponent={
              <ReorderComponent
                orderId={order?.id}
                className="cancel-button"
              />
            }
          />
        )} */}

        <div className="reorder-btn">
          <ReorderComponent orderId={order?.id} />
        </div>
        <div className="order-footer">
          <button className="back-button" onClick={() => navigate("/orders")}>
            <FaArrowLeft /> Back to Orders
          </button>
          {order?.status === "Pending" && (
            <OpenModalButton
              className="cancel-button"
              buttonText="Cancel Order"
              modalComponent={
                <CancelOrderButton
                  orderId={order?.id}
                  className="cancel-button"
                />
              }
            />
          )}
          {order?.status === "Cancelled" && (
            <OpenModalButton
              className="cancel-button"
              buttonText="Delete Order"
              modalComponent={
                <DeleteOrder orderId={order?.id} className="cancel-button" />
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
