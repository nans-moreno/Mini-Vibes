using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class HUDManager : MonoBehaviour
{
    [SerializeField] private TextMeshProUGUI speedText;
    [SerializeField] private TextMeshProUGUI timerText;
    [SerializeField] private TextMeshProUGUI nitroText;
    [SerializeField] private Image nitroBar;
    [SerializeField] private TextMeshProUGUI checkpointText;
    [SerializeField] private GameObject finishScreen;
    [SerializeField] private TextMeshProUGUI finishTimeText;

    private CarController carController;
    private CheckpointManager checkpointManager;
    private float raceStartTime;

    private void Start()
    {
        carController = FindObjectOfType<CarController>();
        checkpointManager = FindObjectOfType<CheckpointManager>();
        raceStartTime = Time.time;

        if (finishScreen != null)
        {
            finishScreen.SetActive(false);
        }
    }

    private void Update()
    {
        UpdateSpeedometer();
        UpdateTimer();
        UpdateNitro();
        UpdateCheckpointDisplay();
    }

    private void UpdateSpeedometer()
    {
        if (carController != null && speedText != null)
        {
            float speed = carController.GetCurrentSpeed();
            speedText.text = $"{speed:F0} km/h";
        }
    }

    private void UpdateTimer()
    {
        if (timerText != null)
        {
            float elapsed = Time.time - raceStartTime;
            int minutes = (int)(elapsed / 60f);
            int seconds = (int)(elapsed % 60f);
            int milliseconds = (int)((elapsed % 1f) * 100f);
            
            timerText.text = $"{minutes:00}:{seconds:00}:{milliseconds:00}";
        }
    }

    private void UpdateNitro()
    {
        if (carController != null)
        {
            float nitroPercent = carController.GetNitroPercent();
            
            if (nitroText != null)
            {
                nitroText.text = $"Nitro: {nitroPercent * 100f:F0}%";
            }

            if (nitroBar != null)
            {
                nitroBar.fillAmount = nitroPercent;
            }
        }
    }

    private void UpdateCheckpointDisplay()
    {
        if (checkpointManager != null && checkpointText != null)
        {
            int current = checkpointManager.GetCurrentCheckpointIndex();
            int total = checkpointManager.GetTotalCheckpoints();
            checkpointText.text = $"Checkpoint: {current}/{total}";
        }
    }

    public void ShowFinishScreen(float totalTime)
    {
        if (finishScreen != null)
        {
            finishScreen.SetActive(true);
            
            if (finishTimeText != null)
            {
                int minutes = (int)(totalTime / 60f);
                int seconds = (int)(totalTime % 60f);
                int milliseconds = (int)((totalTime % 1f) * 1000f);
                
                finishTimeText.text = $"Temps: {minutes:00}:{seconds:00}:{milliseconds:000}";
            }
        }
    }
}
