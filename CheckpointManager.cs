using UnityEngine;
using System.Collections.Generic;

public class CheckpointManager : MonoBehaviour
{
    [SerializeField] private List<Checkpoint> checkpoints = new List<Checkpoint>();
    
    private int currentCheckpointIndex = 0;
    private float raceStartTime = 0f;
    private float lastCheckpointTime = 0f;
    private bool raceFinished = false;
    private float totalRaceTime = 0f;

    private void Start()
    {
        if (checkpoints.Count == 0)
        {
            checkpoints.AddRange(FindObjectsOfType<Checkpoint>());
            checkpoints.Sort((a, b) => a.checkpointIndex.CompareTo(b.checkpointIndex));
        }

        raceStartTime = Time.time;
        lastCheckpointTime = raceStartTime;
    }

    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            CheckCheckpoint(other.gameObject);
        }
    }

    private void CheckCheckpoint(GameObject player)
    {
        Checkpoint hitCheckpoint = GetCheckpointAtPosition(player.transform.position);

        if (hitCheckpoint != null && hitCheckpoint.checkpointIndex == currentCheckpointIndex)
        {
            PassCheckpoint(hitCheckpoint, player);
        }
    }

    private void PassCheckpoint(Checkpoint checkpoint, GameObject player)
    {
        float timeSinceStart = Time.time - raceStartTime;
        float splitTime = Time.time - lastCheckpointTime;

        checkpoint.OnCheckpointPassed(splitTime);
        currentCheckpointIndex++;

        if (currentCheckpointIndex >= checkpoints.Count)
        {
            FinishRace(timeSinceStart, player);
        }

        lastCheckpointTime = Time.time;
    }

    private void FinishRace(float totalTime, GameObject player)
    {
        if (raceFinished) return;

        raceFinished = true;
        totalRaceTime = totalTime;
        
        GameManager.Instance?.OnRaceFinished(totalTime);
    }

    private Checkpoint GetCheckpointAtPosition(Vector3 position)
    {
        foreach (var checkpoint in checkpoints)
        {
            if (Vector3.Distance(checkpoint.transform.position, position) < 10f)
            {
                return checkpoint;
            }
        }
        return null;
    }

    public void ResetRace()
    {
        currentCheckpointIndex = 0;
        raceFinished = false;
        raceStartTime = Time.time;
        lastCheckpointTime = raceStartTime;

        foreach (var checkpoint in checkpoints)
        {
            checkpoint.Reset();
        }
    }

    public int GetCurrentCheckpointIndex() => currentCheckpointIndex;
    public int GetTotalCheckpoints() => checkpoints.Count;
    public float GetTotalRaceTime() => raceFinished ? totalRaceTime : Time.time - raceStartTime;
    public bool IsRaceFinished() => raceFinished;
}
