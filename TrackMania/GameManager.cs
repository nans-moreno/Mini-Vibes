using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    [SerializeField] private Transform playerSpawnPoint;
    [SerializeField] private Transform checkpointRespawnPoint;
    
    private CarController carController;
    private CheckpointManager checkpointManager;
    private HUDManager hudManager;
    private bool gameRunning = true;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
        }
        else
        {
            Instance = this;
        }
    }

    private void Start()
    {
        carController = FindObjectOfType<CarController>();
        checkpointManager = FindObjectOfType<CheckpointManager>();
        hudManager = FindObjectOfType<HUDManager>();

        if (playerSpawnPoint == null)
        {
            playerSpawnPoint = carController.transform;
        }
    }

    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.R))
        {
            RespawnPlayer();
        }

        if (Input.GetKeyDown(KeyCode.Escape))
        {
            TogglePause();
        }
    }

    public void RespawnPlayer()
    {
        if (carController != null && checkpointRespawnPoint != null)
        {
            carController.ResetPosition(checkpointRespawnPoint.position, checkpointRespawnPoint.rotation);
        }
    }

    public void OnRaceFinished(float totalTime)
    {
        gameRunning = false;
        
        if (hudManager != null)
        {
            hudManager.ShowFinishScreen(totalTime);
        }

        Time.timeScale = 0f;
    }

    public void RestartRace()
    {
        Time.timeScale = 1f;
        SceneManager.LoadScene(SceneManager.GetActiveScene().name);
    }

    public void TogglePause()
    {
        gameRunning = !gameRunning;
        Time.timeScale = gameRunning ? 1f : 0f;
    }

    public bool IsGameRunning() => gameRunning;
}
