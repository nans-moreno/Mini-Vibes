using UnityEngine;

public class Checkpoint : MonoBehaviour
{
    public int checkpointIndex = 0;
    [SerializeField] private bool isFinishLine = false;
    
    private float bestSplitTime = float.MaxValue;
    private MeshRenderer meshRenderer;
    private Color originalColor;

    private void Start()
    {
        meshRenderer = GetComponent<MeshRenderer>();
        if (meshRenderer != null)
        {
            originalColor = meshRenderer.material.color;
        }

        GetComponent<Collider>().isTrigger = true;
    }

    public void OnCheckpointPassed(float splitTime)
    {
        if (splitTime < bestSplitTime)
        {
            bestSplitTime = splitTime;
        }

        if (meshRenderer != null)
        {
            meshRenderer.material.color = Color.green;
            Invoke(nameof(ResetColor), 0.5f);
        }
    }

    private void ResetColor()
    {
        if (meshRenderer != null)
        {
            meshRenderer.material.color = originalColor;
        }
    }

    public void Reset()
    {
        ResetColor();
    }

    public float GetBestSplitTime() => bestSplitTime;
    public bool IsFinishLine() => isFinishLine;
}
