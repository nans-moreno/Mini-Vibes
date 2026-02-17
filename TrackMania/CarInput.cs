using UnityEngine;

public class CarInput : MonoBehaviour
{
    private float accelerationInput = 0f;
    private float brakeInput = 0f;
    private float turnInput = 0f;
    private bool nitroActive = false;
    private bool respawnPressed = false;

    private void Update()
    {
        ReadInputs();
    }

    private void ReadInputs()
    {
        accelerationInput = Input.GetAxis("Vertical");
        turnInput = Input.GetAxis("Horizontal");
        
        brakeInput = 0f;
        if (Input.GetKey(KeyCode.S) || Input.GetKey(KeyCode.DownArrow))
        {
            brakeInput = 1f;
        }

        nitroActive = Input.GetKey(KeyCode.Space);
        respawnPressed = Input.GetKeyDown(KeyCode.R);

        if (Input.GetKeyDown(KeyCode.Escape))
        {
            Time.timeScale = Time.timeScale == 1f ? 0f : 1f;
        }
    }

    public float GetAccelerationInput() => Mathf.Max(accelerationInput, 0f);
    public float GetBrakeInput() => brakeInput;
    public float GetTurnInput() => turnInput;
    public bool IsNitroActive() => nitroActive;
    public bool IsRespawnPressed() => respawnPressed;
}
