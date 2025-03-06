import { useState, useEffect } from "react";
import "./SubscriptionsPage.scss";
import { useAppSelector } from "../../../hooks/reduxHooks";
import ISubscription from "../../../entities/ISubscription";
import { AppRootState } from "../../../redux/store";
import API from "../../../shared/constants/API";
import axiosInstance from "../../../shared/config/axiosConfig";
import useSnackbar from "../../../hooks/useSnackbar";
import CustomSnackbar from "../../../components/common/CustomSnackbar";
import Loading from "../../../components/common/Loading/Loading";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const SubscriptionPage = () => {
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  const [plans, setPlans] = useState<ISubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [userActivePlan, setUserActivePlan] = useState<string | null>(null); // Store the active plan name

  const { userInfo, isAuthenticated } = useAppSelector(
    (state: AppRootState) => state.user
  );

  // Check user's subscription status
  const checkSubStatus = async () => {
    if (!isAuthenticated || !userInfo?.email) return;

    try {
      const response = await axiosInstance.get("/order/sub-check");
      const subscription = response.data.data;
      setUserActivePlan(subscription?.name || null);
    } catch (error) {
      console.log("Error checking subscription status:", error);
      // Don't show error to user since this is a background check
    }
  };

  // Fetching plans
  const fetchPlans = async () => {
    try {
      const response = await axiosInstance.get(API.SUBSCRIPTION_GET);
      if (!response) {
        throw new Error("Error Fetching Plans");
      }
      const data = response.data.data.data;
      setPlans([...data.filter((plan: ISubscription) => plan.isActive)]);
    } catch (err) {
      console.log("Error fetching subscription plans:", err);
      showSnackbar("Error Fetching Plans", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await checkSubStatus();
      await fetchPlans();
      setLoading(false);
    };
    initialize();
  }, [userInfo, isAuthenticated]);

  // Loading screen
  if (loading) {
    return (
      <div className="subscription-container">
        <Loading />
      </div>
    );
  }

  // Check if plan is user's current plan
  const isCurrentPlan = (plan: ISubscription) => {
    return isAuthenticated && userActivePlan === plan.name;
  };

  // Payments
  const initializeRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = API.RAZORPAY_CHECKOUT;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (plan: ISubscription) => {
    try {
      // Check if user is logged in
      if (!userInfo) {
        showSnackbar("Please log in to subscribe to a plan", "error");
        return;
      }

      // Check if user already has an active subscription
      if (userActivePlan) {
        showSnackbar("You already have an active subscription.", "error");
        return;
      }

      const res = await initializeRazorpay();
      if (!res) {
        showSnackbar("Razorpay SDK failed to load", "error");
        return;
      }

      let price =
        plan?.discountPrice && plan.discountPrice > 0
          ? plan.discountPrice
          : plan.price;

      // Razorpay backend
      const response = await axiosInstance.post(API.RAZORPAY_ADD, {
        amount: price! * 100,
        currency: "INR",
      });

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: price! * 100,
        currency: "INR",
        name: "SkillForge",
        description: `Purchase Subscription`,
        order_id: response.data.id,
        handler: async (response: RazorpayResponse) => {
          try {
            await axiosInstance.post(API.ORDER_ADD, {
              userEmail: userInfo.email,
              plan: plan.name || "Free",
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              amount: price!,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
            });

            showSnackbar(
              `You have successfully subscribed to the '${
                plan.name || "Free"
              }' plan`,
              "success"
            );
            // Update the user's active plan after successful payment
            setUserActivePlan(plan.name);
          } catch (err) {
            console.log("Error Adding Order", err);
            showSnackbar("Error Adding Order", "error");
          }
        },
        theme: {
          color: "#3399cc",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.log("Error in payment", error);
      showSnackbar("Error in payment", "error");
    }
  };

  return (
    <div className="subscription-container">
      <div className="header">
        <h1>The Right Plan for Your Business</h1>
        <p>
          We have several powerful plans to showcase your business and get
          discovered as a creative entrepreneur. Everything you need.
        </p>
      </div>

      <div className="plans-grid">
        {plans.map((plan) => (
          <div
            key={`${plan._id}`}
            className={`plan-card ${plan.name === "Pro" ? "highlighted" : ""}`}
          >
            <h3>{plan.name || "Free"}</h3>
            <div className="price-container">
              <div className="price">
                {plan.price === 0 ? (
                  <>Free</>
                ) : plan.discountPrice && plan.discountPrice < plan.price! ? (
                  <>
                    <span className="original-price">₹{plan.price}</span>
                    <span className="discount-price">
                      ₹{plan.discountPrice}
                    </span>
                  </>
                ) : (
                  <>₹{plan.price}</>
                )}
                <span className="period">
                  /{plan.price === 0 ? "Forever" : "Month"}
                </span>
              </div>
              {plan.price !== 0 &&
                plan.discountValidity &&
                plan.discountPrice! < plan.price! && (
                  <div className="discount-end">
                    Offer ends{" "}
                    {new Date(plan.discountValidity).toLocaleDateString()}
                  </div>
                )}
            </div>
            <div>{plan.description}</div>
            <ul className="features">
              <li>
                <input
                  type="checkbox"
                  checked={plan.features.hasVideoCall}
                  disabled
                />
                Video Call
              </li>
              <li>
                <input
                  type="checkbox"
                  checked={plan.features.hasChat}
                  disabled
                />
                Chat
              </li>
              <li>
                <input
                  type="checkbox"
                  checked={plan.features.hasCertificate}
                  disabled
                />
                Certificate
              </li>
            </ul>
            {isCurrentPlan(plan) ? (
              <button type="button" disabled className="current-plan">
                Current Plan
              </button>
            ) : (
              <button type="button" onClick={() => handlePayment(plan)}>
                Choose
              </button>
            )}
          </div>
        ))}
      </div>

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </div>
  );
};

export default SubscriptionPage;
