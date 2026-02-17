using UnityEngine;

public class CarController : MonoBehaviour
{
    [SerializeField] private float maxSpeed = 50f;
    [SerializeField] private float acceleration = 150f;
    [SerializeField] private float brakingForce = 200f;
    [SerializeField] private float turnSpeed = 90f;
    [SerializeField] private float driftTraction = 0.5f;
    [SerializeField] private float nitroBoost = 1.5f;
    [SerializeField] private float maxNitro = 100f;
    [SerializeField] private float nitroConsumption = 20f;
    [SerializeField] private float nitroRecharge = 30f;

    private Rigidbody rb;
    private CarInput carInput;
    private float currentSpeed = 0f;
    private float currentNitro = 0f;
    private bool isNitroActive = false;
    private Vector3 lastPosition;
    private float wheelRotation = 0f;

    private void Start()
    {
        rb = GetComponent<Rigidbody>();
        carInput = GetComponent<CarInput>();
        currentNitro = maxNitro * 0.5f;
        lastPosition = transform.position;
    }

    private void FixedUpdate()
    {
        HandleMovement();
        HandleRotation();
        HandleNitro();
        UpdateWheelRotation();
    }

    private void HandleMovement()
    {
        float inputAccel = carInput.GetAccelerationInput();
        float inputBrake = carInput.GetBrakeInput();

        if (inputAccel > 0)
        {
            currentSpeed = Mathf.Min(currentSpeed + acceleration * Time.fixedDeltaTime, maxSpeed);
        }
        else if (inputBrake > 0)
        {
            currentSpeed = Mathf.Max(currentSpeed - brakingForce * Time.fixedDeltaTime, 0f);
        }
        else
        {
            currentSpeed *= 0.98f;
        }

        if (isNitroActive && currentNitro > 0)
        {
            currentSpeed = Mathf.Min(currentSpeed * nitroBoost, maxSpeed * 1.3f);
        }

        Vector3 moveDirection = transform.forward * currentSpeed * Time.fixedDeltaTime;
        rb.velocity = new Vector3(moveDirection.x, rb.velocity.y, moveDirection.z);
    }

    private void HandleRotation()
    {
        float inputTurn = carInput.GetTurnInput();
        float turnAmount = inputTurn * turnSpeed * Time.fixedDeltaTime;
        
        if (currentSpeed > 1f)
        {
            transform.Rotate(0, turnAmount, 0);
        }
    }

    private void HandleNitro()
    {
        isNitroActive = carInput.IsNitroActive();

        if (isNitroActive && currentNitro > 0)
        {
            currentNitro -= nitroConsumption * Time.fixedDeltaTime;
        }
        else
        {
            currentNitro = Mathf.Min(currentNitro + nitroRecharge * Time.fixedDeltaTime, maxNitro);
        }

        currentNitro = Mathf.Clamp(currentNitro, 0f, maxNitro);
    }

    private void UpdateWheelRotation()
    {
        wheelRotation += (currentSpeed * 360f / (2f * Mathf.PI * 0.35f)) * Time.fixedDeltaTime;
    }

    public float GetCurrentSpeed() => currentSpeed;
    public float GetMaxSpeed() => maxSpeed;
    public float GetNitroPercent() => currentNitro / maxNitro;
    public bool IsMoving() => currentSpeed > 0.5f;
    public void ResetPosition(Vector3 newPosition, Quaternion newRotation)
    {
        transform.position = newPosition;
        transform.rotation = newRotation;
        currentSpeed = 0f;
        rb.velocity = Vector3.zero;
    }
}
