using UnityEngine;

namespace VCQLQuestZones
{
    public class CustomZoneContainer
    {
        public GameObject GameObject;
        public string ZoneType;

        public CustomZoneContainer(GameObject gameObject, string zoneType)
        {
            this.GameObject = gameObject;
            this.ZoneType = zoneType;
        }
    }
}